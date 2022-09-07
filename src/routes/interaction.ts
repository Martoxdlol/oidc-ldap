import { NextFunction, Request, Response } from "express";
import config from "../config";
import getProvider from "../provider";

async function interactionRouteHandler(req: Request, res: Response, next: NextFunction) {
    const provider = getProvider()
    try {
        const {
            uid, prompt, params, session,
        } = await provider.interactionDetails(req, res);

        const client = await provider.Client.find(params.client_id as string);
        switch (prompt.name) {
            case 'login': {
                return res.render('login', {
                    config,
                    client,
                    uid,
                    details: prompt.details,
                    params,
                    title: 'Sign-in',
                    session: session,
                });
            }
            case 'consent': {
                return res.render('consent', {
                    config,
                    client,
                    uid,
                    details: prompt.details,
                    params,
                    title: 'Authorize',
                    session: session
                });
            }
            default:
                return undefined;
        }
    } catch (err) {
        return next(err);
    }
}

export default interactionRouteHandler