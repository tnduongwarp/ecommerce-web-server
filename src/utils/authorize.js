import jwt from 'jsonwebtoken'


const config = process.env;

const verifyToken = (req, res, next) => {
    let token = req.header('authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            error: true,
            message: "A token is required for authentication"
        });
    }
    try {
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded;

    } catch (err) {
        console.log(err)
        return res.status(401).json({
            error: true,
            message: "Unauthorized"
        });
    }
    return next();
};
const isUser = (req, res, next) => {

    if (req.user.role === "user") {
        next();
        return;
    }
    else {
        res.status(403).json({ error: true, message: "Required User Role!" });
        return;
    }

}

const isAdmin = (req, res, next) => {

    if (req.user.role === "admin") {
        next();
        return;
    }
    else {
        res.status(403).json({ error: true, message: "Required Admin Role!" });
        return;
    }

}
const isSeller = (req, res, next) => {

    if (req.user.role === "seller") {
        next();
        return;
    }
    else {
        res.status(403).json({ error: true, message: "Required Seller Role!" });
        return;
    }

}
const isSellerOrUser = (req, res, next) => {

    if (req.user.role === "seller" || req.user.role ==='user') {
        next();
        return;
    }
    else {
        res.status(403).json({ error: true, message: "Required Admin Or User Role!" });
        return;
    }

}
const isSellerOrAdmin = (req, res, next) => {

    if (req.user.role === "seller" || req.user.role ==='admin') {
        next();
        return;
    }
    else {
        res.status(403).json({ error: true, message: "Required Admin or Seller Role!" });
        return;
    }

}
const authorization = {
    verifyToken,
    isUser,
    isAdmin, isSeller,
    isSellerOrUser,
    isSellerOrAdmin
}
export default authorization;