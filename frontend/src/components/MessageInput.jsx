import { Flex, Input, InputGroup, Modal, ModalOverlay, ModalContent, InputRightElement, useDisclosure, ModalHeader, ModalCloseButton, ModalBody, Spinner } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { Image } from "@chakra-ui/react";
import { IoSendSharp } from "react-icons/io5";
import { useShowToast } from "../hooks/useShowToast";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import usePreviewImage from "../hooks/usePreviewImage.js";
import {BsFillImageFill} from "react-icons/bs";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const MessageInput = ({setMessages}) => {
  const [messageText, setMessageText] = useState("");
  const showToast = useShowToast();
  const navigate = useNavigate();
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const setConversations = useSetRecoilState(conversationsAtom);
  const { handleImageChange, imgUrl, setImgurl } = usePreviewImage();
  const imageRef = useRef(null);
  const { onClose } = useDisclosure();
  const [isSending, setIsSending] = useState(false);

  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if(!messageText && !imgUrl){
      return;
    }
    if(isSending){
      return;
    }
    setIsSending(true);
    try{
      const res = await fetch("/api/messages", {
        method:"POST",
        headers : {
          'Content-Type' : "application/json",
        },
        body : JSON.stringify({
          message: messageText,
          recipientId : selectedConversation.userId,
          img:imgUrl,
        }),
      });
      const data = await res.json();
      if(data.error){
        showToast("Error", data.error, "error");
        return;
      }
      setMessages((messages) => [...messages, data]);

      setConversations((prevConv) => {
        const updatedConversations = prevConv.map((conversation) => {
          if(conversation._id === selectedConversation._id){
            return {
              ...conversation,
              lastMessage : {
                text : messageText,
                sender : data.sender,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
      
      setMessageText("");
      setImgurl("");
    } catch(err){
      showToast("Error", err.message, "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Flex gap={2} alignItems={"center"}>
        <form onSubmit={handleSendMessage} style={{ flex: 95 }}>
            <InputGroup>
                <Input w={"full"} placeholder='Type a message' onChange={(e) => setMessageText(e.target.value)} value={messageText} />
                <InputRightElement cursor={"pointer"} onClick={handleSendMessage}>
                    <IoSendSharp />
                </InputRightElement>
            </InputGroup>
        </form>
        <Flex flex={5} cursor={"pointer"}>
          <BsFillImageFill size={20} onClick={() => imageRef.current.click()} />
          <Input type={"file"} hidden ref={imageRef} onChange={handleImageChange} />
        </Flex>
        <Flex flex={5} cursor={"pointer"}>
          <FaRegCalendarAlt size={20} onClick={() => navigate(`/chat/scheduleDate/${selectedConversation.userId}`)} />
        </Flex>
        <Modal isOpen={imgUrl} onClose={() => {
            onClose();
            setImgurl("");
          }}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader></ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex mt={5} w={"full"}>
                <Image src={imgUrl} />
              </Flex>
              <Flex justifyContent={"flex-end"} my={2}>
                {!isSending ? (
                  <IoSendSharp size={24} cursor={"pointer"} onClick={handleSendMessage} />
                ) : (
                  <Spinner size={"md"} />
                )}
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
    </Flex>
  )
}


export default MessageInput;