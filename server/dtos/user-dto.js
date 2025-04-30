
class UserDTO {
    id;
    phone;
    email;
    username;

    constructor(user) {
        this.id = user.id; 
        this.phone = user.phone;
        this.email = user.email;
        this.username = user.username;
    }
}

module.exports = UserDTO;
