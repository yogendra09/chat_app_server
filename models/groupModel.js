const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
    },
    image: {
        type: String,
        default: `https://imgs.search.brave.com/_niqrJnkhNgdtMreIdxN-TFprdoqC0UdddqKhTfm56k/rs:fit:860:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvZ3Jv/dXAtY2hhdC1waWN0/dXJlcy13Y2pqN2Zt/MXFtZWwzZmVhLmpw/Zw`
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ]
})

module.exports = mongoose.model('group', groupSchema)