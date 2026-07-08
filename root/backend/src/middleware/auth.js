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

// We won't do this check until we make a sensitive request

import * as authModel from '../model/auth.js';
import * as userModel from '../model/user.js';

/**
 *
 * @param {string} req - Bearer Token Header
 * @param {string} res - Status Code
 * @param {string} next - Next Middleware
 * @returns {string} error Code
 */
export async function check(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const token = authHeader.split(' ')[1];

    const data = authModel.verify(token);

    const user = await userModel.retrieveById(data.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();

  } catch (err) {
    console.error('AUTH ERROR:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
