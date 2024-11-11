import User from "App/Models/User";

class UserService {
  // service methods

  // Delete channel
  public async deleteUser(userId: number): Promise<void> {
    await (await User.findOrFail(userId)).delete();
  }
}

export default new UserService();
