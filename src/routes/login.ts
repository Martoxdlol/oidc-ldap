import assert from "assert";
import { NextFunction, Request, Response } from "express";
import { findUser } from "../ldap/findUser";
import getProvider from "../provider";

async function interactionLoginRouteHandler(req: Request, res: Response, next: NextFunction) {
    const provider = getProvider()

    try {
        const { prompt: { name } } = await provider.interactionDetails(req, res);
        assert.equal(name, 'login');
        // const account = await Account.findByLogin(req.body.login);

        // VERIFY USER CREDENTIALS HERE
        if (typeof req.body.login == 'string' && typeof req.body.password == 'string') {
            const user = await findUser(req.body.login)

            console.log(user.toString())

            if (req.body.password == '1234') {
                const result = {
                    login: {
                        accountId: user.accountId,
                    },
                }

                return await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
            }
        }

        throw new TypeError('Invalid user credentials')
    } catch (err) {
        next(err);
    }
}

export default interactionLoginRouteHandler