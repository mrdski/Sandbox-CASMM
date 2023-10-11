import { Modal, Button, message } from 'antd';
import React, { useEffect, useState } from 'react';
import LearningStandardSelect from './LearningStandardSelect';
import {
  getLearningStandard,
  setSelection,
  getLearningStandardActivities,
} from '../../../../../Utils/requests';
import { useSearchParams } from 'react-router-dom';

export default function LearningStandardModal({
  setActiveLearningStandard,
  gradeId,
  classroomId,
  viewing,
  setActivities,
}) {
  const [visible, setVisible] = useState(false);
  const [activePanel, setActivePanel] = useState('panel-1');
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selected, setSelected] = useState({});
  // eslint-disable-next-line
  const [_, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      if (viewing) {
        const res = await getLearningStandard(viewing);
        if (res.data) {
          setSelected(res.data);
          const activitiesRes = await getLearningStandardActivities(res.data.id);
          if (activitiesRes) setSelectedActivities(activitiesRes.data);
          else {
            message.error(activitiesRes.err);
          }
          setVisible(true);
          setActivePanel('panel-2');
        } else {
          message.error(res.err);
        }
      }
    };
    fetchData();
  }, [viewing]);

  const showModal = () => {
    setActivePanel('panel-1');
    setVisible(true);
  };

  const handleCancel = () => {
    setSearchParams({ tab: 'home' });
    setVisible(false);
  };

  const handleOk = async () => {
    const res = await setSelection(classroomId, selected.id);
    if (res.err) {
      message.error(res.err);
    } else {
      setActiveLearningStandard(selected);
      setActivities(selectedActivities);
      message.success('Successfully updated active learning standard.');
      setSearchParams({ tab: 'home' });
      setVisible(false);
    }
  };

  const handleReview = () => {
    setSearchParams({ tab: 'home', viewing: selected.id });
    setActivePanel('panel-2');
  };

  return (
    <div id='learning-standard-modal'>
      <button id='change-lesson-btn' onClick={showModal}>
        <p id='test'>Change</p>
      </button>
      <Modal
        title={
          activePanel === 'panel-1'
            ? 'Select a Learning Standard:'
            : selected.name
        }
        visible={visible}
        onCancel={handleCancel}
        width='60vw'
        footer={[
          <Button
            key='ok'
            type='primary'
            disabled={selected.id === undefined}
            onClick={activePanel === 'panel-1' ? handleReview : handleOk}
          >
            {activePanel === 'panel-1'
              ? 'Review'
              : 'Set as Active Learning Standard'}
          </Button>,
        ]}
      >
        <LearningStandardSelect
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          selected={selected}
          setSelected={setSelected}
          gradeId={gradeId}
          activities={selectedActivities}
          setActivities={setSelectedActivities}
        />
      </Modal>
    </div>
  );
}
