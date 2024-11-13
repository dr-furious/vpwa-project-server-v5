import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import RegisterUserValidator from "App/Validators/RegisterUserValidator";
import LoginUserValidator from "App/Validators/LoginUserValidator";

export default class AuthController {
  async register({ request }: HttpContextContract) {
    // if invalid, exception
    const data = await request.validate(RegisterUserValidator);

    const user = await User.create(data);
    // join user to general channel
    // const general = await Channel.findByOrFail("name", "general");
    // await user.related("channels").attach([general.id]);

    return user;
  }

  async login({ auth, request }: HttpContextContract) {
    const data = await request.validate(LoginUserValidator);
    const email = data.email;
    const password = data.password;

    return auth.use("api").attempt(email, password);
  }

  async logout({ auth }: HttpContextContract) {
    return auth.use("api").logout();
  }

  async me({ auth }: HttpContextContract) {
    await auth.user!.load("channels", (query) => {
      query.wherePivot("user_channel_status", "in_channel");
    });
    return auth.user;
  }
}
