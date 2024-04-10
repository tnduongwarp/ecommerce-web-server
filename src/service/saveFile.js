
const saveFile = async (req, res) => {
    try {
        console.log(req.files)
        res.status(200).json({
            error: false,
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: true,
            message: 'Internal Server Error'
        })
    }
}
module.exports = saveFile;