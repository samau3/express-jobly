"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   * NOTE:  salary and/or equity may be null.
   *
   * Returns { id, title, salary, equity, company_handle }
   * 
   * */

  static async create({ title, salary=null, equity=null, company_handle }) {

    const result = await db.query(
      `INSERT INTO jobs(
            title, 
            salary, 
            equity, 
            company_handle)
           VALUES
             ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle`,
      [
        title, salary, equity, company_handle
      ]
    );
    const job = result.rows[0];

    return job;
  }
}

module.exports = Job;