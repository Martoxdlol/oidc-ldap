import assert from "assert";
import { NextFunction, Request, Response } from "express";
import getProvider from "../provider";

async function interactionConfirmRouteHandler(req: Request, res: Response, next: NextFunction) {
    const provider = getProvider()

    try {
        const interactionDetails = await provider.interactionDetails(req, res);
        const { prompt: { name, details }, params, session: { accountId } } = interactionDetails as any;
        assert.equal(name, 'consent');

        let { grantId } = interactionDetails;
        let grant;

        if (grantId) {
            // we'll be modifying existing grant in existing session
            grant = await provider.Grant.find(grantId);
        } else {
            // we're establishing a new grant
            grant = new provider.Grant({
                accountId,
                clientId: params.client_id,
            });
        }

        if (details.missingOIDCScope) {
            grant.addOIDCScope((details as any).missingOIDCScope.join(' '));
        }
        if (details.missingOIDCClaims) {
            grant.addOIDCClaims(details.missingOIDCClaims);
        }
        if (details.missingResourceScopes) {
            // eslint-disable-next-line no-restricted-syntax
            for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
                grant.addResourceScope(indicator, (scopes as any).join(' '));
            }
        }

        grantId = await grant.save();

        const consent = {};
        if (!interactionDetails.grantId) {
            // we don't have to pass grantId to consent, we're just modifying existing one
            (consent as any).grantId = grantId;
        }

        const result = { consent };
        await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
    } catch (err) {
        next(err);
    }
}

export default interactionConfirmRouteHandler