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
    it('should create a new TaskUser', async () => {
        // Arrange
        const newUser = {
            name: 'Adam Smith',
            email: 'adam.smith@gmail.com',
            status: 'active',
            role: 'developer'
        };

        // Act
        const res = await chai.request(server)
            .post('/api/task-users')
            .send(newUser);

        // Assert
        expect(res).to.have.status(201);
        expect(res.body).to.include(newUser);
    });
});