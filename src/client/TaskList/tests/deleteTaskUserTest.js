const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const TaskUser = require('../../models/TaskUser');
const { expect } = chai;

chai.use(chaiHttp);

describe('DELETE /api/task-users/:id', () => {
    beforeEach(async () => {
        await TaskUser.deleteMany({});
    });

    it('should delete a TaskUser', async () => {
        const user = await TaskUser.create({
            name: 'Sam Wilson',
            email: 'sam.wilson@example.com',
            status: 'active',
            role: 'analyst'
        });

        const res = await chai.request(server)
            .delete(`/api/task-users/${user._id}`);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message', 'TaskUser deleted successfully');
        const deletedUser = await TaskUser.findById(user._id);
        expect(deletedUser).to.be.null;
    });
});
