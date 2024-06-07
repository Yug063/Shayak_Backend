import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import {createChat} from "../utils/Gemini.js";
export const generateChatCompletionWithGemini = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;
  // const chatData = { message };
  // const { error } = chatValidation.validate(chatData, {
  //   abortEarly: false,
  // });
  // if (error) {
  //   return res.status(400).json({ errors: [{ msg: error.message }] });
  // }
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user)
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunctioned" });
    // console.log(user.chats);
    const newUserChat = {
      content: message,
      role: "user",
    };
    user.chats.push(newUserChat);
    const response = await createChat(message);
    const newBotChat = {
      content: response,
      role: "shayak",
    };
    user.chats.push(newBotChat);
    await user.save();
    return res.status(200).json({ chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    //@ts-ignore
    user.chats = [];
    await user.save();
    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};
