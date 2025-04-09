import mongoose , {Schema} from "mongoose";


const SubscriptionSchema = new Schema({
    subscriber:{ // subscriber is the user who is subscribing to the channel
        type : Schema.Types.ObjectId,
        ref: "User",
    },
    channel : { // channel is the user who is being subscribed to
        type : Schema.Types.ObjectId,
        ref: "User",
    },
} , {
    timestamps: true,
});


export const Subscription = mongoose.model("Subscription", SubscriptionSchema);