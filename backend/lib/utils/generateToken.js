import jwt from 'jsonwebtoken'


export const  generateTokenAndSetCookies = (userId, res) => {
    const token = jwt.sign({userId}, process.env.TOKEN_SECRET, {
        expiresIn: '15d'
    })
    res.cookie('token', token, {
        httpOnly: true,
        maxAge: 15 * 24 * 60 * 60 * 1000, //MS
        sameSite: "strict", // CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== 'development'
    })
}