const { sqlForPartialUpdate } = require('./sql')

describe("updateDatabase", function () {
    test("works", function () {

        const data = { firstName: 'Aliya', age: 32 };
        const sqlCols = { firstName: "first_name", age: "age" };
        const response = sqlForPartialUpdate(data, sqlCols);
        expect(response).toEqual({
            setCols: `"first_name"=$1, "age"=$2`, values: ["Aliya", 32]
        });
    });

    test("no data sent", function () {
        try {
            const data = {};
            const sqlCols = { firstName: "first_name", age: "age" };
            const response = sqlForPartialUpdate(data, sqlCols);
        }
        catch (err) {
            console.log(err)
            expect(err.status).toEqual(400);
            expect(err.message).toEqual("No data");
        }
    });
});