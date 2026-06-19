/*
#######################################################################
#
# Copyright (C) 2020-2026 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/

import * as userModel from '../model/user.js';
import * as authModel from '../model/auth.js';


/**
 *
 * @param {string} req - username and password
 * @param {string} res - error codes
 * @returns {string} status
 */
export async function login(req, res) {
  console.log("LOGIN HIT");
  try {
    const { email, password } = req.body;

    const user = await userModel.retrieveByCredentials(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = authModel.sign({ id: user.id });

    return res.status(200).json({ user, accessToken });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
