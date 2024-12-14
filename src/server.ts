import env from "@config/environment";

import { app } from "@root/app";

app.listen(env["PORT"], () => {
  console.log("Server Running on PORT 9001");
});
