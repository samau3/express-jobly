// Research results on Numeric vs Float
// seems to be related to how when float is being parsed, Node returns a string if it's too large?

// MODELS
// write tests!
// pattern match company model when creating job model
// the update method shouldnt' affect the id or company associated

// ROUTES
// write tests!
// pattern match company routes when creating job routes
// for initial go, don't worry about filtering yet
// add the security middleware similar to the company routes
// add filtering to job route after above tests pass; refactor from there

// COMPANY ROUTE
// write tests!
// update GET for a single company to also include the jobs associated with the company

"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "Back-End Developer",
    salary: 100000,
    equity: 0.25, 
    company_handle: "c1"
  };
  const newJobNoSalaryOrEquity = {
    title: "Junior Developer",
    company_handle: "c1"
  };

  const newJobNoTitle = {
    salary: 100000,
    equity: 0.25, 
    company_handle: "c1"
  };
  const newJobNoCompanyHandle = {
    title: "Python Dedveloper",
    salary: 100000,
    equity: 0.15
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    // console.log("job: ", job);
    // console.log("newJob: ", newJob);

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE company_handle = 'c1'`);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number), 
        title: "Back-End Developer",
        salary: 100000,
        company_handle: "c1",
        equity: "0.25",
      },
    ]);
  });

  
  test("no salary or equity works", async function () {
    let job = await Job.create(newJobNoSalaryOrEquity);

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE company_handle = 'c1'`);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number), 
        title: "Junior Developer",
        salary: null,
        company_handle: "c1",
        equity: null,
      },
    ]);
  });

  // test("bad request with no title", async function () {
  //   try {
  //     await Company.create(newJobNoTitle);
  //     fail();
  //   } catch (err) {
  //     expect(err instanceof BadRequestError).toBeTruthy();
  //   }
  // });

  // test("bad request with no company_handle", async function () {
  //   try {
  //     await Company.create(newJobNoCompanyHandle);
  //     fail();
  //   } catch (err) {
  //     expect(err instanceof BadRequestError).toBeTruthy();
  //   }
  // });
});

/************************************** whereClauseBuilder */

// describe("whereClauseBuilder", function () {
//   const filters = {
//     name: "2",
//     minEmployees: 1,
//     maxEmployees: 2,
//   };
//   const filtersNoName = {
//     minEmployees: 1,
//     maxEmployees: 2,
//   };
//   const filtersNoMinAndNoName = {
//     maxEmployees: 2,
//   };
//   const filtersNoMin = {
//     name: "2",
//     maxEmployees: 2
//   };

//   test("works: all filters", async function () {
//     let { SQL, parameters } = Company._whereClauseBuilder(filters);

//     expect(SQL).toEqual(`WHERE num_employees >= $1 AND num_employees <= $2 AND name ILIKE $3`);
//     expect(parameters).toEqual([1, 2, "_2%"]);
//   });

//   test("works: no name", async function () {
//     let { SQL, parameters } = Company._whereClauseBuilder(filtersNoName);
//     expect(SQL).toEqual(`WHERE num_employees >= $1 AND num_employees <= $2`);
//     expect(parameters).toEqual([1, 2]);
//   });

//   test("works: no name and no min", async function () {
//     let { SQL, parameters } = Company._whereClauseBuilder(filtersNoMinAndNoName);
//     expect(SQL).toEqual(`WHERE num_employees <= $1`);
//     expect(parameters).toEqual([2]);
//   });
//   test("works: no min", async function () {
//     let { SQL, parameters } = Company._whereClauseBuilder(filtersNoMin);
//     expect(SQL).toEqual(`WHERE num_employees <= $1 AND name ILIKE $2`);
//     expect(parameters).toEqual([2, "_2%"]);
//   });

// });


// /************************************** findAll */

// //TODO:  way to make sure test fails by using try catch with fail().  Should be used with all failure cases.
// //       It is a fail-safe in case your test code is faulty in some unexpected way.  Ask in group after lunch.

// describe("findAll", function () {
//   test("works: no filter", async function () {
//     let companies = await Company.findAll();
//     expect(companies).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//       {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 15,
//         logoUrl: "http://c3.img",
//       },
//     ]);
//   });

//   // filter for minEmployees = 2
//   test("works: filter minEmployees=2", async function () {

//     let companies = await Company.findAll({ minEmployees: 2 });
//     expect(companies).toEqual([
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//       {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 15,
//         logoUrl: "http://c3.img",
//       }
//     ]);
//   });

//   // filter for maxEmployees = 2
//   test("works: filter maxEmployees=2", async function () {

//     let companies = await Company.findAll({ maxEmployees: 2 });
//     expect(companies).toEqual([
//       {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       }
//     ]);
//   });

//   // filter for names with 2
//   test("works: filter name contains 2", async function () {

//     let companies = await Company.findAll({ name: "2" });
//     expect(companies).toEqual([
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       }
//     ]);
//   });

//   // filter for min and max employees
//   test("works: filter min and max", async function () {

//     let companies = await Company.findAll({ minEmployees: 2, maxEmployees: 3 });
//     expect(companies).toEqual([
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//     ]);
//   });

//   test("works: filter min and name", async function () {

//     let companies = await Company.findAll({ minEmployees: 2, name: 3 });
//     expect(companies).toEqual([
//       {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 15,
//         logoUrl: "http://c3.img",
//       }
//     ]);
//   });

//   test("works: filter min and max", async function () {

//     let companies = await Company.findAll({ minEmployees: 2, maxEmployees: 20 });
//     expect(companies).toEqual([
//       {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//       {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 15,
//         logoUrl: "http://c3.img",
//       }
//     ]);
//   });

//   test("works: filter min, max, name (no output)", async function () {

//     let companies = await Company.findAll({ minEmployees: 2, maxEmployees: 3, name: 1 });
//     expect(companies).toEqual([]);
//   });

//   test("works: filter min, max, name", async function () {

//     let companies = await Company.findAll({ minEmployees: 2, maxEmployees: 15, name: 3 });
//     expect(companies).toEqual([
//       {
//         handle: "c3",
//         name: "C3",
//         description: "Desc3",
//         numEmployees: 15,
//         logoUrl: "http://c3.img",
//       }
//     ]);
//   });

//   // doesn't work if filtering for min greater than max
//   test("doesn't work: min greater than max", async function () {
//     try {
//       await Company.findAll({ minEmployees: 11, maxEmployees: 2 });
//       fail()
//     } catch (err) {
//       expect(err.status).toEqual(400);
//       expect(err.message).toEqual("Min Employees must be less than Max Employees"); // change to be accurate
//     }
//   });

// });

// /************************************** get */

// describe("get", function () {
//   test("works", async function () {
//     let company = await Company.get("c1");
//     expect(company).toEqual({
//       handle: "c1",
//       name: "C1",
//       description: "Desc1",
//       numEmployees: 1,
//       logoUrl: "http://c1.img",
//     });
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.get("nope");
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });

// /************************************** update */

// describe("update", function () {
//   const updateData = {
//     name: "New",
//     description: "New Description",
//     numEmployees: 10,
//     logoUrl: "http://new.img",
//   };

//   test("works", async function () {
//     let company = await Company.update("c1", updateData);
//     expect(company).toEqual({
//       handle: "c1",
//       ...updateData,
//     });

//     const result = await db.query(
//       `SELECT handle, name, description, num_employees, logo_url
//            FROM companies
//            WHERE handle = 'c1'`);
//     expect(result.rows).toEqual([{
//       handle: "c1",
//       name: "New",
//       description: "New Description",
//       num_employees: 10,
//       logo_url: "http://new.img",
//     }]);
//   });

//   test("works: null fields", async function () {
//     const updateDataSetNulls = {
//       name: "New",
//       description: "New Description",
//       numEmployees: null,
//       logoUrl: null,
//     };

//     let company = await Company.update("c1", updateDataSetNulls);
//     expect(company).toEqual({
//       handle: "c1",
//       ...updateDataSetNulls,
//     });

//     const result = await db.query(
//       `SELECT handle, name, description, num_employees, logo_url
//            FROM companies
//            WHERE handle = 'c1'`);
//     expect(result.rows).toEqual([{
//       handle: "c1",
//       name: "New",
//       description: "New Description",
//       num_employees: null,
//       logo_url: null,
//     }]);
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.update("nope", updateData);
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });

//   test("bad request with no data", async function () {
//     try {
//       await Company.update("c1", {});
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
// });

// /************************************** remove */

// describe("remove", function () {
//   test("works", async function () {
//     await Company.remove("c1");
//     const res = await db.query(
//       "SELECT handle FROM companies WHERE handle='c1'");
//     expect(res.rows.length).toEqual(0);
//   });

//   test("not found if no such company", async function () {
//     try {
//       await Company.remove("nope");
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });
