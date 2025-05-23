import { Avatar, Box, Button, Flex, Menu, MenuButton, MenuItem, MenuList, Portal, Text, VStack } from "@chakra-ui/react";
import { Link } from "@chakra-ui/react";
import { FaLinkedin } from 'react-icons/fa';
import {CgMoreO} from 'react-icons/cg';
import { useToast } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import {Link as RouterLink} from "react-router-dom";
import { useState } from "react";
import { useShowToast } from "../hooks/useShowToast";
import useFollowUnfollow from "../hooks/useFollowUnfollow.js";

const UserHeader = ({user}) => {
    const toast = useToast();
    const currentUser = useRecoilValue(userAtom);
    const showToast = useShowToast();
    const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);
    
    const copyURL =()=> {
        const currUrl = window.location.href;
        navigator.clipboard.writeText(currUrl).then(() => {
            toast({description:"Profile URL copied", status:"success", duration:3000, isClosable:true});
        });
    }

    return (
        <VStack gap={4} alignItems={'start'}>
            <Flex justifyContent={"space-between"} w={"full"}>
                <Box>
                    <Text fontSize={"2xl"} fontWeight={"bold"}>
                        {user.name}
                    </Text>
                    <Flex gap={2} alignItems={"center"}>
                        <Text fontSize={"sm"}>{user.username}</Text>
                        <Text fontSize={"xs"} bg={"gray.dark"} color={"gray.light"} p={1} borderRadius={"full"}>wire.net</Text>
                    </Flex>
                </Box>
                <Box>
                    {user.profilePic && 
                    <Avatar 
                    name={user.name}
                    src={user.profilePic}
                    size={{
                        base:"md",
                        md: "xl",
                    }}
                />}
                {!user.profilePic && 
                    <Avatar 
                    name={user.name}
                    src={"https://bit.ly/broken-link"}
                    size={{
                        base:"md",
                        md: "xl",
                    }}
                />}
                </Box>
            </Flex>
            <Text>{user.bio}</Text>
            {currentUser?._id === user._id &&
            <Link as={RouterLink} to="/update">
                <Button size={"sm"}>Update Profile</Button>
            </Link>}
            {currentUser?._id !== user._id &&
                <Button size={"sm"} onClick={handleFollowUnfollow} isLoading={updating}>{following ? "Unfollow" : "Follow"}</Button>
            }
            <Flex w={"full"} justifyContent={"space-between"}>
                <Flex gap={2} alignItems={"center"}>
                    <Text color={"gray.light"}>{user.followers.length} followers</Text>
                    <Box w="1" h="1" bg={"gray.light"} borderRadius={"full"}></Box>
                    <Link color={"gray.light"}>linkedin.com</Link>
                </Flex>
                <Flex>
                    <Box className="icon-container">
                        <FaLinkedin size={24} cursor={"pointer"}/>
                    </Box>
                    <Box className="icon-container">
                        <Menu>
                            <MenuButton>
                                <CgMoreO size={24} cursor={"pointer"}/>
                            </MenuButton>
                            <Portal>
                                <MenuList bg={"gray.dark"}>
                                    <MenuItem bg={"gray.dark"} onClick={copyURL}>Copy Link</MenuItem>
                                </MenuList>
                            </Portal>
                        </Menu>
                    </Box>
                </Flex>
            </Flex>
            <Flex w={"full"}>
                <Flex flex={1} borderBottom={"1.5px solid white"} justifyContent={"center"} pb={3} cursor={"pointer"}>
                    <Text fontWeight={"bold"}>Wire Posts</Text>
                </Flex>
                <Flex flex={1} borderBottom={"1.5px solid gray"} justifyContent={"center"} pb={3} color={"gray.light"} cursor={"pointer"}>
                    <Text fontWeight={"bold"}>Replies</Text>
                </Flex>
            </Flex>
        </VStack>
    );
}

export default UserHeader;