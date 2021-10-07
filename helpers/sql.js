const { BadRequestError } = require("../expressError");

/**
 * Receives data from request body and SQL columns from
 * class methods.
 * 
 * Data can include:
 *  User data: { firstName, lastName, password, email, isAdmin } or
 *  Company data: {name, description, numEmployees, logoUrl}
 * 
 * Returns the updated SQL columns and their updated values
 * 
 * Throws BadRequestError(400) if no data was submitted to update
 * 
 */

// Include an example of the data input and output in the docstring itself.
// sqlForPartialUpdate() ...
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
