import React from 'react';
import { useGetCreatorCourseQuery } from '@/redux/features/course/courseApi';

const CourseQueryTest: React.FC = () => {
  console.log("🚨 CourseQueryTest component rendering");

  const {
    data: coursesData,
    isLoading: isCoursesLoading,
    isError: isCoursesError,
    error: coursesError,
    refetch: refetchCourses,
    requestId,
    fulfilledTimeStamp,
    isUninitialized,
    isFetching,
  } = useGetCreatorCourseQuery(
    { id: "685c1b673a862730dd0a3b21" },
    { skip: false }
  );

  console.log("🚨 CourseQueryTest hook results:");
  console.log("🚨 coursesData:", coursesData);
  console.log("🚨 isCoursesLoading:", isCoursesLoading);
  console.log("🚨 isCoursesError:", isCoursesError);
  console.log("🚨 coursesError:", coursesError);
  console.log("🚨 requestId:", requestId);
  console.log("🚨 fulfilledTimeStamp:", fulfilledTimeStamp);
  console.log("🚨 isUninitialized:", isUninitialized);
  console.log("🚨 isFetching:", isFetching);

  return (
    <div style={{ padding: '20px', border: '2px solid red', margin: '10px' }}>
      <h3>Course Query Test Component</h3>
      <p>isLoading: {isCoursesLoading.toString()}</p>
      <p>isError: {isCoursesError.toString()}</p>
      <p>isUninitialized: {isUninitialized.toString()}</p>
      <p>isFetching: {isFetching.toString()}</p>
      <p>requestId: {requestId || 'undefined'}</p>
      <p>Data: {JSON.stringify(coursesData, null, 2)}</p>
      <button onClick={() => refetchCourses()}>Manual Refetch</button>
    </div>
  );
};

export default CourseQueryTest;
