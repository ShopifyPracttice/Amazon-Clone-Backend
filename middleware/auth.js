const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next)=>{
    const token = req.cookies["token"]
    // console.log(req.cookies["token"], req.cookies);
    if(!token){
        return res.status(401).json({ message: "Unauthorized" });
    }

    try{
      const decoded = jwt.verify(token, "secret1234")
      req.userId = decoded.userId;


      next();
    }catch(err){
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        } else {
            return res.status(401).json({ message: "Unauthorized" });
        }

    }
}

module.exports = verifyToken