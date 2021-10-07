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

  static async findAll(searchFilters = {}) {
    // need to pass in the query parameters
    // need to selective implement where clauses based on parameters
    // using a helper function? separate query thing?
    // throw an error if min/max parameters are out of bounds
    // write tests first before trying to implement these ideas

    const { name, minEmployees, maxEmployees } = searchFilters;
    if (minEmployees > maxEmployees) throw new BadRequestError("Min Employees must be less than Max Employees");

    // if searchFilter is empty, return all companies unfiltered
    if (Object.keys(searchFilters).length === 0) {
      const companiesRes = await db.query(
        `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           ORDER BY name`);
      return companiesRes.rows;
    }
    // otherwise, apply the filters via the whereClauseBuilder
    else {
      const { SQL, parameters } = this.whereClauseBuilder({ name, minEmployees, maxEmployees })

      const companiesRes = await db.query(
        `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE ${SQL}
           ORDER BY name`, parameters);
      return companiesRes.rows;
    }

  }

  // WHERE Clause builder
  // input -> query object
  // if a filter key is there, then add appropriate WHERE clause
  // additional ones will have AND between them

  /** Takes in an object and returns a string for SQL*/
  static whereClauseBuilder(filters) {
    let whereClauses = [];
    let counter = 0;
    let values = [];
    if (filters.minEmployees !== undefined) {
      whereClauses.push(`num_employees >= $${++counter}`); // $1
      values.push(filters.minEmployees);
    }
    if (filters.maxEmployees !== undefined) {
      whereClauses.push(`num_employees <= $${++counter}`);
      values.push(filters.maxEmployees);
    }
    if (filters.name !== undefined) {
      whereClauses.push(`name ILIKE $${++counter}`);
      values.push(`_${filters.name}%`);
    }
    // console.log("values in builder", values)

    return {
      SQL: whereClauses.join(" AND "),
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
