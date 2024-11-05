const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const TaskUser = require('../../models/TaskUser');
const { expect } = chai;

chai.use(chaiHttp);

//Test the functionaliry of creating a new user
describe('POST /api/task-users', () => {

    //we do this to reset our database for testing purposres
    beforeEach(async () => {
        await TaskUser.deleteMany({});
    });
    
    //need to finish this part
});