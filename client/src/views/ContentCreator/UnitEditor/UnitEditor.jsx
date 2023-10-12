import React, { useState, useEffect } from 'react';
import { Form, Input, Modal, message } from 'antd';
import { getUnit, updateUnit } from '../../../Utils/requests';

import './UnitEditor.less';

export default function UnitCreator({ id, unitName }) {
  const [visible, setVisible] = useState(false);
  const [gradeId, setGradeId] = useState('');
  const [grade, setGrade] = useState('');
  const [name, setName] = useState(unitName);
  const [number, setNumber] = useState('');
  const [description, setDescription] = useState('');
  const [standard, setStandard] = useState('');

  const [displayName, setDisplayName] = useState(unitName);

  const showModal = async () => {
    setVisible(true);
    const res = await getUnit(id);
    setGrade(res.data.grade.name);
    setGradeId(res.data.grade.id);
    setName(res.data.name);
    setNumber(res.data.number);
    setDescription(res.data.standards_description);
    setStandard(res.data.standards_id);
  };

  useEffect(() => {
    setDisplayName(unitName);
  }, [unitName]);

  useEffect(() => {
    const fetchUnit = async () => {
      const res = await getUnit(id);
      setGrade(res.data.grade.name);
      setGradeId(res.data.grade.id);
      setName(res.data.name);
      setNumber(res.data.number);
      setDescription(res.data.standards_description);
      setStandard(res.data.standards_id);
    };
    fetchUnit();
  }, [id]);

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await updateUnit(
      id,
      number,
      name,
      standard,
      description,
      gradeId
    );
    if (response.err) {
      message.error('Fail to update unit');
    } else {
      message.success('Update unit success');
      setDisplayName(name);
      setVisible(false);
    }
  };

  return (
    <div>
      <button id='link-btn' onClick={showModal}>
        {displayName}
      </button>
      <Modal
        title='Unit Editor'
        visible={visible}
        width='35vw'
        onCancel={handleCancel}
        onOk={handleSubmit}
      >
        <Form
          id='add-units'
          labelCol={{
            span: 6,
          }}
          wrapperCol={{
            span: 14,
          }}
          layout='horizontal'
          size='default'
        >
          <Form.Item id='form-label' label='Grade'>
            <Input
              onChange={(e) => setName(e.target.value)}
              value={grade}
              disabled
            />
          </Form.Item>
          <Form.Item id='form-label' label='Unit Name'>
            <Input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder='Enter unit name'
            />
          </Form.Item>
          <Form.Item id='form-label' label='Unit Number'>
            <Input
              onChange={(e) => setNumber(e.target.value)}
              type='number'
              value={number}
              placeholder='Enter unit number'
              min={1}
              max={15}
            />
          </Form.Item>
          <Form.Item id='form-label' label='Description'>
            <Input.TextArea
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              rows={3}
              placeholder='Enter unit description'
            />
          </Form.Item>
          <Form.Item id='form-label' label='StandardS'>
            <Input
              onChange={(e) => setStandard(e.target.value)}
              value={standard}
              placeholder='Enter unit Standards'
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
