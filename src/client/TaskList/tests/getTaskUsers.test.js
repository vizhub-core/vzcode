const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const TaskUser = require('../../models/TaskUser');
const { expect } = chai;

chai.use(chaiHttp);

describe('GET /api/task-users', () => {
    beforeEach(async () => {
        await TaskUser.deleteMany({});
    });

    it('should retrieve all TaskUsers', async () => {
        const users = [
            { name: 'John Doe', email: 'john.doe@example.com', status: 'active', role: 'developer' },
            { name: 'Jane Smith', email: 'jane.smith@example.com', status: 'inactive', role: 'designer' }
        ];
        await TaskUser.insertMany(users);

        const res = await chai.request(server).get('/api/task-users');
        expect(res).to.have.status(200);
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.include(users[0]);
        expect(res.body[1]).to.include(users[1]);
    });

    it('should retrieve a single TaskUser by ID', async () => {
        const user = await TaskUser.create({
            name: 'Alice Johnson',
            email: 'alice.johnson@example.com',
            status: 'active',
            role: 'manager'
        });

        const res = await chai.request(server).get(`/api/task-users/${user._id}`);
        expect(res).to.have.status(200);
        expect(res.body).to.include({
            name: 'Alice Johnson',
            email: 'alice.johnson@example.com',
            status: 'active',
            role: 'manager'
        });
    });
});
