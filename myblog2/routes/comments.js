const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const CommentModel = require('../lib/mongo').Comment

// blog /comments 创建一条留言
router.post('/', checkLogin, function (req, res, next) {
    const author = req.session.user._id
    const blogId = req.fields.blogId
    const content = req.fields.content

    // 校验参数
    try {
        if (!content.length) {
            throw new Error('请填写留言内容')
        }
    } catch (e) {
        req.flash('error', e.message)
        return res.redirect('back')
    }

    const comment = {
        author: author,
        blogId: blogId,
        content: content
    }

    CommentModel.create(comment, function (err, data) {
        req.flash('success', '留言成功')
        // 留言成功后跳转到上一页
        res.redirect('back')
    })
})

// GET /comments/:commentId/remove 删除一条留言
router.get('/:commentId/remove', checkLogin, function (req, res, next) {
    const commentId = req.params.commentId
    const author = req.session.user._id

    CommentModel.findById(commentId, function (err, comment) {
        if (!comment) {
            throw new Error('留言不存在')
        }
        if (comment.author.toString() !== author.toString()) {
            throw new Error('没有权限删除留言')
        }
        CommentModel.deleteOne({_id: comment}, function () {
            req.flash('success', '删除留言成功')
            // 删除成功后跳转到上一页
            res.redirect('back')
        })
    })
})

module.exports = router
