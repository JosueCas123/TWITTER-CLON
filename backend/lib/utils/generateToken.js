import jwt from 'jsonwebtoken'


export const  generateTokenAndSetCookies = (userId, res) => {
    const token = jwt.sign({userId}, process.env.TOKEN_SECRET, {
        expiresIn: '1d'
    })
    res.cookie('token', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'none',
        secure: process.env.NODE_ENV !== 'development'
    })
}