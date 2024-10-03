

export function getUsername(req, context) {
    const userData = req.session.user

    if (userData) {
        return context.username = userData.username
    } else {
        return context.username = null
    }
}