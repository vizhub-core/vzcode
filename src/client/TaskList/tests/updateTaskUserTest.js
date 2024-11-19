const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const TaskUser = require('../../models/TaskUser');
const { expect } = chai;

chai.use(chaiHttp);

describe('PUT /api/task-users/:id', () => {
    beforeEach(async () => {
        await TaskUser.deleteMany({});
    });

    it('should update a TaskUser', async () => {
        const user = await TaskUser.create({
            name: 'Bob Marley',
            email: 'bob.marley@example.com',
            status: 'active',
            role: 'developer'
        });
        const updatedData = { role: 'lead developer' };
        const res = await chai.request(server)
            .put(`/api/task-users/${user._id}`)
            .send(updatedData);

        expect(res).to.have.status(200);
        expect(res.body.role).to.equal('lead developer');
    });
});