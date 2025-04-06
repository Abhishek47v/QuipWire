import { Box, Container } from '@chakra-ui/react';
import {Navigate, Routes, Route, useLocation} from 'react-router-dom';
import PostPage from './pages/PostPage';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import { useRecoilValue } from 'recoil';
import userAtom from './atoms/userAtom';
import UpdateProfilePage from "./pages/UpdateProfilePage";
import UserPage from './pages/UserPage';
import CreatePost from "./components/CreatePost";
import ChatPage from './pages/ChatPage';
import ScheduleDate from './components/ScheduleDate.jsx';

function App() {
  const user = useRecoilValue(userAtom);
  const { pathname } = useLocation();

  return (
    <Box position={"relative"} w="full">
      <Container maxW={pathname === "/" ? {base:"700px", md:"900px"} : "700px"}>
        <Header />
        <Routes>
          <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
          <Route path="/update" element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />} />
          <Route path="/:username" element={<UserPage />} />
          <Route path="/:username/post/:pid" element={<PostPage />} />
          <Route path="/chat" element={user ? <ChatPage /> : <Navigate to ="/auth" /> } />
          <Route path="/chat/ScheduleDate" element={<ScheduleDate />} />
          <Route path="/chat/scheduleDate/:userId" element={<ScheduleDate />} />
        </Routes>
        {user && <CreatePost />}
      </Container>
    </Box>
  )
}

export default App
