import cookie from "cookie";
import jwt from "jsonwebtoken";
import ApiError from "../Utils/ApiError.js";
import User from "../Models/user.model.js";
import ActiveUser from "../Models/activeUser.model.js";
import { AvailableChatEvents, ChatEventEnum } from "../constant.js";

/**
 * @param {Server} io
 */
export const initializeSocketIO = (io) => {
  return io.on("connection", async (socket) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      let token = cookies?.accessToken;

      if (!token) {
        token = socket.handshake.auth?.token;
      }
      if (!token) {
        throw new ApiError(
          401,
          "Un-authorized handshake. Token is missing",
          [],
          undefined,
          undefined,
          false
        );
      }
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
      );

      if (!user) {
        throw new ApiError(
          401,
          "Un-authorized handshake. Token is invalid",
          [],
          undefined,
          undefined,
          false
        );
      }

      socket.user = user;
      socket.join(user._id.toString());
      console.log("User connected 🗼. userId: ", user._id.toString());

      // Initialize the events
      socket.on("JOIN_ADMIN", ({ restaurantID }) => {
        socket.join(`ADMIN_${restaurantID}`);
        console.log("Admin joined room:", restaurantID);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });

    } catch (error) {
      socket.emit(
        ChatEventEnum.SOCKET_ERROR_EVENT,
        error?.message || "Something went wrong while connecting to the socket."
      );
    }
  });
};

/**
 * @param {import("express").Request} req
 * @param {string} roomId
 * @param {AvailableChatEvents[0]} event
 * @param {any} payload
 * @description Utility function responsible to abstract the logic of socket emission via the io instance
 */
export const emitSocketEvent = (req, roomId, event, payload) => {
  console.log("Event Triggered", {
    event: event,
    roomId: roomId,
    payload: payload,
  });
  req.app.get("io").in(roomId).emit(event, payload);
};
