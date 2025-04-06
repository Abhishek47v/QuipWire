import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
    const token  = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn : '10d',
    });

    res.cookie("jwt", token, {
        httpOnly : true, // This cookie can't be accessed by browser
        maxAge: 10*24*60*60*1000,
        sameSite:"strict", 
    })
    return token;
};

export default generateTokenAndSetCookie;