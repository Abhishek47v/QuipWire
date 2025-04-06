import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Conversation",
    },
    sender : {
        type:mongoose.Schema.Types.ObjectId, 
        ref:"User",
    },
    text : {
        type:String,
    },
    seen: {
        type: Boolean,
        default: false,
    },
    img: {
        type: String,
        default: "",
    },
    isScheduled: {
        type: Boolean,
        default: false,
    },
    date: {
        type: String,
        required: function () { return this.isScheduled; },
    },
    time: {
        type: String,
        required: function () { return this.isScheduled; },
    },
}, {
    timestamps:true
});

const Message = mongoose.model("Message", messageSchema);
export default Message;