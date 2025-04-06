import { Avatar, AvatarBadge, Flex, Stack, useColorMode, useColorModeValue, WrapItem } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { Image } from "@chakra-ui/react";
import { useRecoilState, useRecoilValue } from "recoil";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import userAtom from "../atoms/userAtom.js";
import { selectedConversationAtom } from "../atoms/messagesAtom.js";

const Conversation = ({conversation, isOnline}) => {
    const user = conversation.participants[0];
    const currUser =  useRecoilValue(userAtom);
    const lastMessage = conversation.lastMessage;
    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
    // console.log(selectedConversation);
    const colorMode = useColorMode();

  return (
    <Flex gap={4} alignItems={"center"} p={1} 
        _hover={{cursor:"pointer",bg:useColorModeValue("gray.600", "gray.dark"), color:"white"}}
        borderRadius={"md"}
        onClick={() => setSelectedConversation({
            _id : conversation._id,
            userId : user._id,
            username:user.username,
            userProfilePic : user.profilePic,
            mock : conversation.mock,
        })}
        bg={selectedConversation?._id === conversation._id ? (colorMode === "light" ? "gray.500" : "gray.dark") : ""}
    >
        <WrapItem>
            <Avatar size={{base:"xs", sm:"sm", md:"md"}} src={user.profilePic} >
                {isOnline ? <AvatarBadge boxSize={"1em"} bg="green.500" /> : ""}
            </Avatar>
        </WrapItem>
        <Stack direction={"column"} fontSize={"sm"}>
            <Text fontWeight="700" display={"flex"} alignItems={"center"}>
                {user.username} <Image src="/verified.png" w={4} h={4} ml={1} />
            </Text>
            <Text fontSize={"xs"} display={"flex"} alignItems={"center"} gap={1}>
            {/* {currUser._id === lastMessage.sender ? (
                <Box color={lastMessage.seen ? "blue.400" : ""} >
                    <BsCheck2All size={16} />
                </Box>
            ) : ("")}
            {lastMessage.text.length > 18 ? lastMessage.text.substring(0, 18) + "..." : lastMessage.text || <BsFillImageFill  size={16} /> } */}
            </Text>
        </Stack>
    </Flex>
  )
}

export default Conversation;