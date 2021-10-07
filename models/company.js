"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies(
          handle,
          name,
          description,
          num_employees,
          logo_url)
           VALUES
             ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [
        handle,
        name,
        description,
        numEmployees,
        logoUrl,
      ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies that match filter conditions, if any.
   *
   * Takes in filter object and returns and array of company objects
   * 
   * Can contain none or any of the filters name, minEmployees, or maxEmployees
   * {name: string, minEmployees: number, maxEmployees: number} ->
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * 
   * */
  // Add the WHERE keyword to the whereClause builder.
  // Loose the second query by adding string interpolation for where clause that may be an empty string.

  static async findAll(searchFilters = {}) {
    let { name, minEmployees, maxEmployees } = searchFilters;
    
    if (minEmployees > maxEmployees) throw new BadRequestError("Min Employees must be less than Max Employees");
    const { SQL, parameters } = this._whereClauseBuilder({ name, minEmployees, maxEmployees });

    const companiesRes = await db.query(
      `SELECT handle,
              name,
              description,
              num_employees AS "numEmployees",
              logo_url AS "logoUrl"
          FROM companies
          ${SQL} 
          ORDER BY name`, parameters);
    return companiesRes.rows;
  }

  /** Takes in an object with at least one filter condition
   *  returns an object with key value pair of SQL where clause and filter object's values
   * 
   * { minEmployees: 2, maxEmployees: 20, name: "Com"} -->
   * 
   * Returns {
   *    SQL: "WHERE num_employees >= $1 AND num_employees <= $2 AND name ILIKE $3",
   *    parameters: [2, 20, "_Com%"]
   * }
   * 
  */

  static _whereClauseBuilder(filters) {
  let whereClauses = [];
  let completedWhereClause = "";
  let values = [];

  if (filters.minEmployees !== undefined) {
    values.push(filters.minEmployees);
    whereClauses.push(`num_employees >= $${values.length}`);
  }
  if (filters.maxEmployees !== undefined) {
    values.push(filters.maxEmployees);
    whereClauses.push(`num_employees <= $${values.length}`);
  }
  if (filters.name !== undefined) {
    values.push(`_${filters.name}%`); // added the "_" and "%" to enable SQL contains query
    whereClauses.push(`name ILIKE $${values.length}`);
  }
  // console.log("values in builder", values)
  if (whereClauses.length > 0) completedWhereClause = 'WHERE ' + `${whereClauses.join(" AND ")}`;
  return {
    SQL: completedWhereClause,
    parameters: values
  }
}

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
  const companyRes = await db.query(
    `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
    [handle]);

  const company = companyRes.rows[0];

  if (!company) throw new NotFoundError(`No company: ${handle}`);

  return company;
}

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
  const { setCols, values } = sqlForPartialUpdate(
    data,
    {
      numEmployees: "num_employees",
      logoUrl: "logo_url",
    });
  const handleVarIdx = "$" + (values.length + 1);

  const querySql = `
      UPDATE companies
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
  const result = await db.query(querySql, [...values, handle]);
  const company = result.rows[0];

  if (!company) throw new NotFoundError(`No company: ${handle}`);

  return company;
}

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
  const result = await db.query(
    `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
    [handle]);
  const company = result.rows[0];

  if (!company) throw new NotFoundError(`No company: ${handle}`);
}
}


module.exports = Company;
