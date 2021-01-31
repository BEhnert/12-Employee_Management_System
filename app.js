var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  // Your port; if not 3306
  port: 3306,
  // Your username
  user: "boot2020",
  // Your password
  password: "password",
  database: "personnel",
  multipleStatements: true
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  mainMenu();
});

console.clear();
const mainMenu = async () => {
  console.clear();
  inquirer
    .prompt({
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: ["View All Employees", "View All Employees by Manager", "View All Employees by Department",
        "Add Employee", "Remove Employee", "Update Employee Role", "Update Employee Manager", "View All Data"]
    })
    .then(function (answer) {
      let action = answer.action;
      console.log(action);
      switch (answer.action) {
        case ("View All Employees"):
          viewAllEmp();
          break;
        case ("View All Employees by Manager"):
          viewAllByMgr();
          break;
        case ("View All Employees by Department"):
          viewByDept();
          break;
        case ("Add Employee"):
          addEmployee();
          break;
        case ("Remove Employee"):
          removeEmployee();
          break;
        case ("Update Employee Role"):
          updateRole();
          break;
        case ("Update Employee Manager"):
          updateMgr();
          break;
        case ("View All Data"):
          viewAllData();
          break;
      }
    });
};

function viewAllEmp() {
  console.clear();
  connection.query("SELECT * FROM employee", function (err, results) {
    if (err) throw err;
    console.table(results);
    setTimeout(mainMenu, 3000)
  });
  console.clear();
}

const viewAllByMgr = async () => {
  connection.query("SELECT first_name, last_name, id FROM employee WHERE manager_id IS NULL ORDER by manager_id ", function (err, results) {
    if (err) throw err;
    let modResults = results.map(each => {
      return `${each.id} ${each.first_name} ${each.last_name}`
    })
    inquirer.prompt({
      message: "Choose a manager",
      type: "list",
      name: "person",
      choices: modResults
    })
      .then(function (answer) {
        let id = answer.person.split(" ")[0];
        connection.query(`SELECT first_name, last_name 
      FROM personnel.employee WHERE manager_id = ${id}`,
          function (err, results) {
            if (err) throw err;
            console.table(results);
            setTimeout(mainMenu, 3000);
          });
      });
  });
}

const viewByDept = async () => {
  inquirer.prompt({
    type: "list",
    name: "action",
    message: "Which department do you want to view?",
    choices: ["Sales", "Engineering",
      "Finance", "Legal"]
  })
    .then(function (answer) {
      let action = answer.action;
      let dept_id;
      if (action === "Sales") {
        dept_id = 1;
      }
      else if (action === "Engineering") {
        dept_id = 2;
      }
      else if (action === "Finance") {
        dept_id = 3;
      }
      else if (action === "Legal") {
        dept_id = 4;
      }

      connection.query(`SELECT * 
      FROM personnel.employee
      INNER JOIN personnel.roles 
      ON personnel.employee.role_id = personnel.roles.id
      INNER JOIN personnel.department
      ON personnel.roles.dept_id = personnel.department.id
      where personnel.department.id=${dept_id}`, function (err, results) {
        if (err) throw err;
        console.table(results);
        setTimeout(mainMenu, 3000);
      });

    });
}

const addEmployee = async () => {
  connection.query("SELECT first_name, last_name, id FROM employee WHERE manager_id IS NULL ORDER by manager_id ", function (err, results) {
    if (err) throw err;
    let modResults = results.map(each => {
      return `${each.id} ${each.first_name} ${each.last_name}`
    })
    inquirer
      .prompt([
        {
          name: "firstName",
          type: "input",
          message: "What is the employee's first name?"
        },
        {
          name: "lastName",
          type: "input",
          message: "What is the employee's last name?"
        },
        {
          type: "list",
          name: "role",
          message: "What is the employee's role??",
          choices: [
            { name: "Sales", value: '1' },
            { name: "Engineering", value: '2' },
            { name: "Finance", value: '3' },
            { name: "Legal", value: '4' }
          ]
        },

        {
          type: "list",
          name: "manager",
          message: "Who is the employee's manager?",
          choices: modResults
        }
      ])
      .then(function (answer) {
        console.log(answer.role);
        console.log(answer.manager);
        // when finished prompting, insert a new item into the db with that info
        let id = answer.manager.split(" ")[0];
        connection.query(
          "INSERT INTO employee SET ?",
          {
            first_name: answer.firstName,
            last_name: answer.lastName,

            //NEED TO GET ROLES, THEN IDs, same for MANAGER
            role_id: answer.role,
            manager_id: id
          },
          function (err) {
            if (err) throw err;
            console.log("Your employee was created successfully!");
            setTimeout(mainMenu, 3000);
          }
        );
      });
  });
}

const removeEmployee = async => {
  console.log("remove emp");
  connection.query("SELECT first_name, last_name, id FROM employee WHERE manager_id IS NOT NULL",
    function (err, results) {
      if (err) throw err;
      let modResults = results.map(each => {
        return `${each.id} ${each.first_name} ${each.last_name}`
      });
      inquirer.prompt({
        message: "Choose employee to remove",
        type: "list",
        name: "person",
        choices: modResults
      })
        .then(function (answer) {
          let id = answer.person.split(" ")[0];
          connection.query(`DELETE FROM employee WHERE id = ${id}`,
            // {
            //   first_name: answer.firstName,
            //   last_name: answer.lastName,
            // },
            function (err, results) {
              if (err) throw err;
              console.table(results);
              setTimeout(mainMenu, 3000)
            });
        });
    });
}
const updateRole = async => {
  connection.query("SELECT id, title FROM roles",
    function (err, results) {
      if (err) throw err;
      console.log(results);
      let roleResults = results.map(each => {
        return `${each.id} ${each.title}`
      });
      console.log(roleResults);
  connection.query("SELECT first_name, last_name, id FROM employee",
  function (err, results) {
    if (err) throw err;
    console.log(results);
    let modResults = results.map(each => {
      return `${each.id} ${each.first_name} ${each.last_name}`
    });
    console.log(modResults);

    inquirer.prompt([
      {
      message: "Which employee's role do you want to update?",
      type: "list",
      name: "person",
      choices: modResults
      },
      {
        message: "What is the employee's new role?",
        type: "list",
        name: "role",
        choices: roleResults
      }
    ]
    )
      .then(function (answer) {
        console.log(answer.person);
        console.log(answer.role);
        let id = answer.person.split(" ")[0];
        let role_id = answer.role.split(" ")[0];
        connection.query(`UPDATE employee SET ? WHERE id = ${id}`,
          {
            role_id: role_id
          },
          function (err, results) {
            if (err) throw err;
            console.table(results);
            setTimeout(mainMenu, 3000)
          });
      });
  });
});
}

const updateMgr = async => {
  connection.query("SELECT first_name, last_name, id FROM employee WHERE manager_id IS NULL",
    function (err, results) {
      if (err) throw err;
      console.log(results);
      let mgrResults = results.map(each => {
        return `${each.id} ${each.first_name} ${each.last_name}`
      });
      console.log(mgrResults);
      connection.query("SELECT first_name, last_name, id FROM employee WHERE manager_id IS NOT NULL",
        function (err, results) {
          if (err) throw err;
          console.log(results);
          let modResults = results.map(each => {
            return `${each.id} ${each.first_name} ${each.last_name}`
          });
          console.log(modResults);

          inquirer.prompt([
            {
            message: "Which employee do you want to update with new manager?",
            type: "list",
            name: "person",
            choices: modResults
            },
            {
              message: "Who is the employee's new manager?",
              type: "list",
              name: "manager",
              choices: mgrResults
            }
          ]
          )
            .then(function (answer) {
              console.log(answer.person);
              console.log(answer.manager);
              let id = answer.person.split(" ")[0];
              let mgr_id = answer.manager.split(" ")[0];
              connection.query(`UPDATE employee SET ? WHERE id = ${id}`,
                {
                  manager_id: mgr_id
                },
                function (err, results) {
                  if (err) throw err;
                  console.table(results);
                  setTimeout(mainMenu, 3000)
                });
            });
        });
    });
}

const viewAllData = async => {
  console.clear();
  connection.query("SELECT employee.id, first_name, last_name, title, salary, dept_name from employee, roles, department where employee.role_id=roles.id && roles.dept_id=department.id", function (err, results) {
    if (err) throw err;
    console.table(results);
    setTimeout(mainMenu, 3000)
  });
  console.clear();
}

