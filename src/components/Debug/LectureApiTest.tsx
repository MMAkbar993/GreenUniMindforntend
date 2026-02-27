import React, { useEffect } from 'react';
import { useGetLectureByCourseIdQuery } from '@/redux/features/lecture/lectureApi';
import { useAppSelector } from '@/redux/hooks';
import { selectCurrentToken, selectCurrentUser } from '@/redux/features/auth/authSlice';

interface LectureApiTestProps {
  courseId: string;
}

const LectureApiTest: React.FC<LectureApiTestProps> = ({ courseId }) => {
  // Get auth state from Redux
  const currentToken = useAppSelector(selectCurrentToken);
  const currentUser = useAppSelector(selectCurrentUser);

  const { data, isLoading, isError, error } = useGetLectureByCourseIdQuery(
    { id: courseId },
    {
      skip: !courseId,
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    console.log('🧪 LectureApiTest - API Response:', {
      courseId,
      isLoading,
      isError,
      error,
      data,
      dataData: data?.data,
      dataDataLength: data?.data?.length,
      timestamp: new Date().toISOString()
    });

    // Check auth state
    const localStorageToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('🧪 Auth Check:', {
      reduxToken: currentToken,
      reduxUser: currentUser,
      localStorageToken: localStorageToken,
      refreshToken: refreshToken,
      hasLocalToken: !!localStorageToken,
      hasRefreshToken: !!refreshToken,
      tokenLength: localStorageToken?.length,
      tokenStart: localStorageToken?.substring(0, 20) + '...',
      userRole: currentUser?.role || currentUser?.user?.role
    });
  }, [courseId, isLoading, isError, error, data, currentToken, currentUser]);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px',
      zIndex: 9999,
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <h4>🧪 Lecture API Test</h4>
      <p><strong>Course ID:</strong> {courseId}</p>
      <p><strong>Redux Token:</strong> {currentToken ? 'Yes' : 'No'}</p>
      <p><strong>LocalStorage Token:</strong> {localStorage.getItem('accessToken') ? 'Yes' : 'No'}</p>
      <p><strong>Refresh Token:</strong> {localStorage.getItem('refreshToken') ? 'Yes' : 'No'}</p>
      <p><strong>User Role:</strong> {currentUser?.role || currentUser?.user?.role || 'None'}</p>
      <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
      <p><strong>Error:</strong> {isError ? 'Yes' : 'No'}</p>
      {isError && error && (
        <div style={{ fontSize: '10px', color: 'red', marginTop: '5px' }}>
          <p><strong>Error Details:</strong></p>
          <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '100px', overflow: 'auto' }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
      <p><strong>Data:</strong> {data ? 'Yes' : 'No'}</p>
      <p><strong>Data.data:</strong> {data?.data ? 'Yes' : 'No'}</p>
      <p><strong>Lectures Count:</strong> {data?.data?.length || 0}</p>
      {data?.data && (
        <div>
          <p><strong>Lectures:</strong></p>
          <ul style={{ fontSize: '10px', maxHeight: '100px', overflow: 'auto' }}>
            {data.data.map((lecture: any, index: number) => (
              <li key={lecture._id || index}>
                {lecture.lectureTitle || 'No title'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LectureApiTest;
