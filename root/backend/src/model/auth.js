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
// We won't need this till we do a JWT check

import jwt from 'jsonwebtoken';

/**
 *
 * @param {string} token - JWT
 * @returns {string} tokenized
 */
export function verify(token) {
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    delete data.iat;
    delete data.exp;
    return data;
  } catch (err) {
    throw err;
  }
}

/**
 *
 * @param {string} data - not JWT
 * @returns {object} signed JWT
 */
export function sign(data) {
  return jwt.sign(
      data,
      process.env.JWT_SECRET, {
        expiresIn: '30m',
        algorithm: 'HS256',
      });
};
