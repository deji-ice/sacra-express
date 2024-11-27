export const validateUser = (req, res, next) => {
  const ourPassword = "a_typical_longass_password";
  const { password } = req.headers;
  if (password === ourPassword) {
    return next();
  }
  res.status(401).json({ message: "unauthorized" }); 
};
