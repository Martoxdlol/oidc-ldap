import assert from "assert";
import { NextFunction, Request, Response } from "express";
import { findUser } from "../ldap/findUser";
import validateUserCredentials from "../ldap/validateUserCredentials";
import getProvider from "../provider";

async function interactionLoginRouteHandler(req: Request, res: Response, next: NextFunction) {
    const provider = getProvider()

    let shouldNext = true

    try {
        const { prompt: { name }, uid } = await provider.interactionDetails(req, res);
        assert.equal(name, 'login');
        assert.equal(typeof req.body.login, 'string')
        assert.equal(typeof req.body.password, 'string')

        const user = await findUser(req.body.login)

        if (!user) {
            res.redirect('/interaction/' + uid + '?unf=1')
            return
        }

        const validationResult = await validateUserCredentials(req.body.login, req.body.password)

        if(validationResult.error && validationResult.error.name === 'InvalidCredentialsError') {
            res.redirect('/interaction/' + uid + '?bpw=1')
            return
        }

        if(!validationResult.user && validationResult.error) {
            res.redirect('/interaction/' + uid + '?uke=1')
            return 
        }

        if (validationResult.user) {
            const result = {
                login: {
                    accountId: user.accountId,
                },
            }

            return await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
        }
    } catch (err) {
        if (shouldNext) next(err)
    }
}

export default interactionLoginRouteHandler