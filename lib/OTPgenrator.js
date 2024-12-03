import * as OTPAuth from "otpauth"; // Importing the otpauth module

export const OTPgenerator = async (id) => {
  
  // Create a new TOTP object.
  let totp = new OTPAuth.TOTP({
    // Provider or service the account is associated with.
    issuer: "ACME",
    // Account identifier.
    label: "Alice",
    // Algorithm used for the HMAC function, possible values are:
    //   "SHA1", "SHA224", "SHA256", "SHA384", "SHA512",
    //   "SHA3-224", "SHA3-256", "SHA3-384" and "SHA3-512".
    algorithm: "SHA1",
    // Length of the generated tokens.
    digits: 6,
    // Interval of time for which a token is valid, in seconds.
    period: 60,
    // Arbitrary key encoded in base32 or `OTPAuth.Secret` instance
    // (if omitted, a cryptographically secure random secret is generated).
    secret: OTPAuth.Secret.fromHex(id),
    //   or: `OTPAuth.Secret.fromBase32("US3WHSG7X5KAPV27VANWKQHF3SH3HULL")`
    //   or: `new OTPAuth.Secret()`
  });

  let token = totp.generate();
  console.log("TOKEN:", token);

  return token;
};
