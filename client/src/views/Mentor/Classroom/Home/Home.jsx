import React, { useEffect, useState } from 'react';
import './Home.less';
import {
  getClassroom,
  getLessonModule,
  getLessonModuleActivities,
} from '../../../../Utils/requests';
import MentorSubHeader from '../../../../components/MentorSubHeader/MentorSubHeader';
import DisplayCodeModal from './DisplayCodeModal';
import MentorActivityDetailModal from './MentorActivityDetailModal';
import LessonModuleModal from './LessonModuleSelect/LessonModuleModal';
import { message, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function Home({ classroomId, viewing }) {
  const [classroom, setClassroom] = useState({});
  const [activities, setActivities] = useState([]);
  const [gradeId, setGradeId] = useState(null);
  const [activeLessonModule, setActiveLessonModule] = useState(null);
  const [activityDetailsVisible, setActivityDetailsVisible] = useState(false)
  const navigate = useNavigate();

  const SCIENCE = 1;
  const MAKING = 2;
  const COMPUTATION = 3;

  useEffect(() => {
    const fetchData = async () => {
      const res = await getClassroom(classroomId);
      if (res.data) {
        const classroom = res.data;
        setClassroom(classroom);
        setGradeId(classroom.grade.id);
        classroom.selections.forEach(async (selection) => {
          if (selection.current) {
            const lsRes = await getLessonModule(
              selection.lesson_module
            );
            if (lsRes.data) setActiveLessonModule(lsRes.data);
            else {
              message.error(lsRes.err);
            }
            const activityRes = await getLessonModuleActivities(lsRes.data.id);
            if (activityRes) setActivities(activityRes.data);
            else {
              message.error(activityRes.err);
            }
          }
        });
      } else {
        message.error(res.err);
      }
    };
    fetchData();
  }, [classroomId]);

  const handleViewActivity = (activity, name) => {
    activity.lesson_module_name = name;
    localStorage.setItem('sandbox-activity', JSON.stringify(activity));
    navigate('/sandbox');
  };

  const openActivityInWorkspace = (activity, name) => {
    activity.lesson_module_name = name;
    activity.template = activity.activity_template;
    delete activity.id;
    delete activity.activity_template;
    localStorage.setItem('sandbox-activity', JSON.stringify(activity));
    navigate('/sandbox');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const color = [
    'magenta',
    'purple',
    'green',
    'cyan',
    'red',
    'geekblue',
    'volcano',
    'blue',
    'orange',
    'gold',
    'lime',
  ];

  return (
    <div>
      <button id='home-back-btn' onClick={handleBack}>
        <i className='fa fa-arrow-left' aria-hidden='true' />
      </button>
      <DisplayCodeModal code={classroom.code} />
      <MentorSubHeader title={classroom.name}></MentorSubHeader>
      <div id='home-content-container'>
        <div id='active-lesson-module'>
          {activeLessonModule ? (
            <div>
              <div id='active-lesson-module-title-container'>
                <h3>{`Learning Standard - ${activeLessonModule.name}`}</h3>
                <LessonModuleModal
                  setActiveLessonModule={setActiveLessonModule}
                  classroomId={classroomId}
                  gradeId={gradeId}
                  viewing={viewing}
                  setActivities={setActivities}
                />
              </div>
              <p id='lesson-module-expectations'>{`Expectations: ${activeLessonModule.expectations}`}</p>
             {activeLessonModule.link ? (
                <p>
                  Addtional resources to the lesson:{' '}
                  <a
                    href={activeLessonModule.link}
                    target='_blank'
                    rel='noreferrer'
                  >
                    {activeLessonModule.link}
                  </a>
                </p>
              ) : null}
              {activities ? (
                <div id='card-btn-container' className='flex space-between'>
                  {activities.map((activity) => (
                    <div id="view-activity-card" key={activity.id}>
                      <div id='activity-title'>
                       Activity Level {activity.number}
                       </div>
                      <div id='view-activity-heading' style={{display: "flex"}}>
                        
                        <button
                          id='view-activity-button'
                          style={{marginRight: "auto"}}
                          onClick={() =>
                            handleViewActivity(activity, activeLessonModule.name)
                          }
                        >
                          Student Template
                        </button>
                        {activity.activity_template && (
                          <button
                            id='view-activity-button'
                            style={{marginRight: "auto"}}
                            onClick={() =>
                              openActivityInWorkspace(
                                activity,
                                activeLessonModule.name
                              )
                            }
                          >
                            Demo Template
                          </button>
                        )}
                        <MentorActivityDetailModal
                          learningStandard={activeLessonModule}
                          selectActivity={activity}
                          activityDetailsVisible={false}
                          setActivityDetailsVisible={false}
                          setActivities={setActivities}
                          viewing={false}
                        />
                      </div>
                      <div id='view-activity-info'>
                        <p>
                          <strong>STANDARDS: </strong>
                          {activity.StandardS}
                        </p>
                        <p>
                          <strong>Description: </strong>
                          {activity.description}
                        </p>
                        <p>
                          <strong>Classroom Materials: </strong>
                          {activity.learning_components
                            .filter(
                              (component) =>
                                component.learning_component_type === SCIENCE
                            )
                            .map((element, index) => {
                              return (
                                <Tag
                                  key={index}
                                  color={color[(index + 1) % 11]}
                                >
                                  {element.type}
                                </Tag>
                              );
                            })}
                        </p>
                        <p>
                          <strong>Student Materials: </strong>
                          {activity.learning_components
                            .filter(
                              (component) =>
                                component.learning_component_type === MAKING
                            )
                            .map((element, index) => {
                              return (
                                <Tag
                                  key={index}
                                  color={color[(index + 4) % 11]}
                                >
                                  {element.type}
                                </Tag>
                              );
                            })}
                        </p>
                        <p>
                          <strong>Arduino Components: </strong>
                          {activity.learning_components
                            .filter(
                              (component) =>
                                component.learning_component_type ===
                                COMPUTATION
                            )
                            .map((element, index) => {
                              return (
                                <Tag
                                  key={index}
                                  color={color[(index + 7) % 11]}
                                >
                                  {element.type}
                                </Tag>
                              );
                            })}
                        </p>
                        {activity.link ? (
                          <p>
                            <strong>Link to Additional Information: </strong>
                            <a href={activity.link} target='_blank' rel='noreferrer'>
                              {activity.link}
                            </a>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <p>There is currently no active lesson set.</p>
              <p>Click the button below to browse available lessons.</p>
              <LessonModuleModal
                setActiveLessonModule={setActiveLessonModule}
                classroomId={classroomId}
                gradeId={gradeId}
                viewing={viewing}
                setActivities={setActivities}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
