import React, { useEffect, useRef, useState, useReducer } from 'react';
import '../../ActivityLevels.less';
import {Spin, Row, Col, Alert} from 'antd';

export default function BlockList({activity}) {
  const [selectedCompile, setSelectedCompile] = useState(false);
  const [compileError, setCompileError] = useState('');

  const workspaceRef = useRef(null);
  const activityRef = useRef(null);

  const setWorkspace = () => {
    const previewDiv = document.getElementById('list-midtop');
    const previewWorkspace = Blockly.inject(previewDiv, {
      media: '../../media/',
      scrollbars: false,
    });
    const block = previewWorkspace.newBlock(null);
    block.moveBy(50, 50);
    block.initSvg();
    block.render();
  };

  useEffect(() => {
    // once the activity state is set, set the workspace and save
    const setUp = async () => {
      activityRef.current = activity;
      if (!workspaceRef.current && activity && Object.keys(activity).length !== 0) {
        setWorkspace();
      }
    };
    setUp();
  }, [activity]);

  // block category and block selection
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleBlockClick = (block) => {
    setSelectedBlock(block === selectedBlock ? null : block);
  };


  return (
    <div id='horizontal-container' className='flex flex-column'>
      <div className='flex flex-row'>
        <div
          id='bottom-container'
          className='flex flex-column vertical-container overflow-visible'
        >
          <Spin
            tip='Compiling Code Please Wait... It may take up to 20 seconds to compile your code.'
            className='compilePop'
            size='large'
            spinning={selectedCompile}
          >
            <Row id='icon-control-panel'>
              <Col flex='none' id='section-header'>
                Block List
              </Col>
            </Row>
            <div id='blockly-canvas' />
            <Row id='list-left'>
      {activity &&
        activity.toolbox &&
        activity.toolbox.map(([category, blocks]) => (
          <div
            key={category}
            onMouseEnter={() => setHoveredItem(category)}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              marginBottom: '5px',
            }}
          >
            <p
              onClick={() => handleCategoryClick(category)}
              style={{ backgroundColor: selectedCategory === category ? 'lightgray' : hoveredItem === category ? 'lightyellow' : 'transparent' }}
            >
              {category}
            </p>
            {selectedCategory === category && (
              <div>
                {blocks.map((block) => (
                  <p
                    key={block.name}
                    onClick={() => handleBlockClick(block)}
                    onMouseEnter={() => setHoveredItem(block.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{ backgroundColor: selectedBlock === block ? 'lightgray' : hoveredItem === block.name ? 'lightyellow' : 'transparent' }}
                  >
                    {block.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </Row>
            <Row id='list-midtop'>
              Block Preview
            </Row>
            <Row id='list-midbottom'>
              {selectedBlock && (
                <div>
                  <h3>Documentation</h3>
                  <p>{selectedBlock.description}</p>
                </div>
              )}
            </Row>
            <Row id='list-right'>
              Classes
            </Row>
          </Spin>
        </div>
      </div>

      {compileError && (
        <Alert
          message={compileError}
          type='error'
          closable
          onClose={(e) => setCompileError('')}
        ></Alert>
      )}
    </div>
  );
}
