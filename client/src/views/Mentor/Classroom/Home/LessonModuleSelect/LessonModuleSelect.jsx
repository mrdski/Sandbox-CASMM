import React, { useEffect, useState } from 'react';
import {Modal, Button} from 'antd';
import { AutoComplete, Divider, message, Tag } from 'antd';
import './LessonModuleSelect.less';
import {
  getLessonModule,
  getUnits,
  getLessonModuleActivities,
} from '../../../../../Utils/requests';
import CheckUnits from './CheckUnits';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function LessonModuleSelect({
  selected,
  setSelected,
  activePanel,
  setActivePanel,
  gradeId,
  activities,
  setActivities,
}) {
  const [searchOptions, setSearchOptions] = useState([]);
  const [units, setUnits] = useState([]);
  const [visibleStandardsByUnit, setVisibleStandardsByUnit] = useState([]);
  const [plainOptions, setPlainOptions] = useState([]);
  const [checkedList, setCheckedList] = useState([]);
  // eslint-disable-next-line
  const [_, setSearchParams] = useSearchParams();
  const navigator = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const res = await getUnits(gradeId);
      if (res.data) {
        const u = res.data;
        setUnits(u);
        setVisibleStandardsByUnit(u);
        const options = u.map((unitData) => {
          return {
            id: unitData.id,
            number: unitData.number,
            name: unitData.name,
          };
        });
        setPlainOptions(options);
        setCheckedList(options);
      } else {
        message.error(res.err);
      }
    }
    if (gradeId) fetchData();
  }, [setVisibleStandardsByUnit, gradeId]);

  const getSelectedLessonModule = async (standard) => {
    const res = await getLessonModule(standard.id);
    if (res.data) {
      setSelected(res.data);
    } else {
      message.error(res.err);
    }
    const activitiresRes = await getLessonModuleActivities(res.data.id);
    if (activitiresRes) setActivities(activitiresRes.data);
    else {
      message.error(activitiresRes.err);
    }
  };

  const getFinishedWords = (word) => {
    let words = [];
    units.forEach((unit) => {
      if (checkedList.find((checked) => checked.id === unit.id)) {
        unit.lesson_modules.forEach((ls) => {
          if (ls.name.toLowerCase().startsWith(word.toLowerCase())) {
            words.push({ value: ls.name });
          }
        });
      }
    });
    return words;
  };

  const onSearch = (searchText) => {
    let words = getFinishedWords(searchText);
    setSearchOptions(words);
    let values = [];
    words.forEach((word) => {
      values.push(word.value);
    });
    let visible = [];
    units.forEach((unit) => {
      let u = { ...unit };
      u.lesson_modules = unit.lesson_modules.filter((ls) => {
        return values.includes(ls.name);
      });
      if (u.lesson_modules.length > 0) {
        visible.push(u);
      }
    });
    visible.length > 0
      ? setVisibleStandardsByUnit(visible)
      : setVisibleStandardsByUnit(units);
  };

  const onSelect = (value) => {
    let visible = units.filter((ls) => {
      return ls.name === value;
    });
    visible.length > 0
      ? setVisibleStandardsByUnit(visible)
      : setVisibleStandardsByUnit(units);
  };

  const handleViewActivity = (activity) => {
    activity.lesson_module_name = selected.name;
    localStorage.setItem('my-activity', JSON.stringify(activity));
    navigator('/activity');
  };

  const handleBack = () => {
    setSearchParams({ tab: 'home' });
    setActivePanel('panel-1');
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

  const SCIENCE = 1;
  const MAKING = 2;
  const COMPUTATION = 3;

  return (
    <div className='overflow-hidden'>
      <div
        id='panel-1'
        className={activePanel === 'panel-1' ? 'panel-1 show' : 'panel-1 hide'}
      >
        <div className='flex flex-column'>
          <div id='search'>
            <AutoComplete
              options={searchOptions}
              placeholder='Search learning standards'
              onSelect={onSelect}
              onSearch={onSearch}
            />
          </div>
          <div id='check-units'>
            <CheckUnits
              plainOptions={plainOptions}
              checkedList={checkedList}
              setCheckedList={setCheckedList}
            />
          </div>
        </div>
        <div id='list-container'>
          {visibleStandardsByUnit.map((unit) => {
            return checkedList.find((checked) => checked.id === unit.id) ? (
              <div key={unit.id}>
                <Divider orientation='left'>{`Unit ${unit.number}- ${unit.name}`}</Divider>
                {unit.lesson_modules.map((ls) => (
                  <div
                    key={ls.id}
                    id={
                      selected.id !== ls.id
                        ? 'list-item-wrapper'
                        : 'selected-lesson-module'
                    }
                    onClick={() => getSelectedLessonModule(ls)}
                  >
                    <li>{ls.name}</li>
                  </div>
                ))}
              </div>
            ) : null;
          })}
        </div>
      </div>
      <div
        id='panel-2'
        className={activePanel === 'panel-2' ? 'panel-2 show' : 'panel-2 hide'}
      >
        <button id='back-btn' onClick={handleBack}>
          <i className='fa fa-arrow-left' aria-hidden='true' />
        </button>
        <div id='ls-info'>
          <p id='lesson-module-expectations-title'>Description:</p>
          <p id='lesson-module-expectations'>{selected.expectations}</p>
          {selected.link ? (
            <p>
              Link to addtional resources:{' '}
              <a href={selected.link} target='_blank' rel='noreferrer'>
                {selected.link}
              </a>
            </p>
          ) : null}
          <div id='btn-container' className='flex space-between'>
            {activities
              ? activities.map((activity) => (
                  // <button key={activity.id} onClick={() => handleViewActivity(activity)}>{`View Activity ${activity.number}`}</button>
                  <div id='view-activity-button' key={activity.id}>
                    <h3
                      onClick={() => handleViewActivity(activity)}
                      id='view-activity-title'
                    >{`View Activity ${activity.number}`}</h3>
                    <div id='view-activity-description'>
                      <p
                        className='view-activity-component-label'
                        style={{ marginTop: '0px' }}
                      >
                        <strong>STANDARDS:</strong> {activity.StandardS}
                      </p>
                      <p className='view-activity-component-label'>
                        <strong>Description:</strong> {activity.description}
                      </p>
                      <p className='view-activity-component-label'>
                        <strong>Science Components: </strong>
                      </p>
                      <div>
                        {activity.learning_components
                          .filter(
                            (component) =>
                              component.learning_component_type === SCIENCE
                          )
                          .map((element, index) => {
                            return (
                              <Tag
                                className='tag'
                                key={index}
                                color={color[(index + 1) % 11]}
                              >
                                {element.type}
                              </Tag>
                            );
                          })}
                      </div>
                      <p className='view-activity-component-label'>
                        <strong>Making Components: </strong>
                      </p>
                      <div>
                        {activity.learning_components
                          .filter(
                            (component) =>
                              component.learning_component_type === MAKING
                          )
                          .map((element, index) => {
                            return (
                              <Tag
                                className='tag'
                                key={index}
                                color={color[(index + 4) % 11]}
                              >
                                {element.type}
                              </Tag>
                            );
                          })}
                      </div>
                      <p className='view-activity-component-label'>
                        <strong>Computation Components: </strong>
                      </p>
                      <div>
                        {activity.learning_components
                          .filter(
                            (component) =>
                              component.learning_component_type === COMPUTATION
                          )
                          .map((element, index) => {
                            return (
                              <Tag
                                className='tag'
                                key={index}
                                color={color[(index + 7) % 11]}
                              >
                                {element.type}
                              </Tag>
                            );
                          })}
                      </div>
                      {activity.link ? (
                        <p className='view-activity-component-label'>
                          <strong>Link to Additional Information: </strong>
                          <a href={activity.link} target='_blank' rel='noreferrer'>
                            {activity.link}
                          </a>
                        </p>
                      ) : null}
                      
                    </div>
                  </div>
                ))
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}
