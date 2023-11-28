import React, { useEffect, useRef, useState, useReducer } from 'react';
import { Link } from 'react-router-dom';
import '../../ActivityLevels.less';
import { compileArduinoCode } from '../../Utils/helpers';
import { message, Spin, Row, Col, Alert, Menu, Dropdown } from 'antd';
import CodeModal from '../modals/CodeModal';
import ConsoleModal from '../modals/ConsoleModal';
import PlotterModal from '../modals/PlotterModal';
import {
  connectToPort,
  handleCloseConnection,
  handleOpenConnection,
} from '../../Utils/consoleHelpers';
import ArduinoLogo from '../Icons/ArduinoLogo';
import PlotterLogo from '../Icons/PlotterLogo';
import PublicCanvas from './PublicCanvas';
import NavBar from '../../../NavBar/NavBar';

let plotId = 1;

export default function BlockList({}) {
  const [hoverUndo, setHoverUndo] = useState(false);
  const [hoverRedo, setHoverRedo] = useState(false);
  const [hoverCompile, setHoverCompile] = useState(false);
  const [hoverConsole, setHoverConsole] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [showPlotter, setShowPlotter] = useState(false);
  const [plotData, setPlotData] = useState([]);
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [selectedCompile, setSelectedCompile] = useState(false);
  const [compileError, setCompileError] = useState('');

  const [forceUpdate] = useReducer((x) => x + 1, 0);
  const workspaceRef = useRef(null);
  const activityRef = useRef(null);
  const [blockList, setBlockList] = useState(false);
  const activity = null;




    //  useStates for Program your Arduino... / Custom Blocks
    const selectedFeature= 'Custom Block List';

  const setWorkspace = () => {
    workspaceRef.current = window.Blockly.inject('blockly-canvas', {
      toolbox: document.getElementById('toolbox'),
    });
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

  const handleUndo = () => {
    if (workspaceRef.current.undoStack_.length > 0)
      workspaceRef.current.undo(false);
  };

  const handleRedo = () => {
    if (workspaceRef.current.redoStack_.length > 0)
      workspaceRef.current.undo(true);
  };

  const handleConsole = async () => {
    if (showPlotter) {
      message.warning('Close serial plotter before openning serial monitor');
      return;
    }
    // if serial monitor is not shown
    if (!showConsole) {
      // connect to port
      await handleOpenConnection(9600, 'newLine');
      // if fail to connect to port, return
      if (typeof window['port'] === 'undefined') {
        message.error('Fail to select serial device');
        return;
      }
      setConnectionOpen(true);
      setShowConsole(true);
    }
    // if serial monitor is shown, close the connection
    else {
      if (connectionOpen) {
        await handleCloseConnection();
        setConnectionOpen(false);
      }
      setShowConsole(false);
    }
  };

  const handlePlotter = async () => {
    if (showConsole) {
      message.warning('Close serial monitor before openning serial plotter');
      return;
    }

    if (!showPlotter) {
      await handleOpenConnection(
        9600,
        'plot',
        plotData,
        setPlotData,
        plotId,
        forceUpdate
      );
      if (typeof window['port'] === 'undefined') {
        message.error('Fail to select serial device');
        return;
      }
      setConnectionOpen(true);
      setShowPlotter(true);
    } else {
      plotId = 1;
      if (connectionOpen) {
        await handleCloseConnection();
        setConnectionOpen(false);
      }
      setShowPlotter(false);
    }
  };

  const handleCompile = async () => {
    if (showConsole || showPlotter) {
      message.warning(
        'Close Serial Monitor and Serial Plotter before uploading your code'
      );
    } else {
      if (typeof window['port'] === 'undefined') {
        await connectToPort();
      }
      if (typeof window['port'] === 'undefined') {
        message.error('Fail to select serial device');
        return;
      }
      setCompileError('');
      await compileArduinoCode(
        workspaceRef.current,
        setSelectedCompile,
        setCompileError,
        activity,
        false
      );
    }
  };

  const menu = (
    <Menu>
      <Menu.Item onClick={handlePlotter}>
        <PlotterLogo />
        &nbsp; Show Serial Plotter
      </Menu.Item>
      <CodeModal title={'XML'} workspaceRef={workspaceRef.current} />
      <Menu.Item>
        <CodeModal title={'Arduino Code'} workspaceRef={workspaceRef.current} />
      </Menu.Item>
    </Menu>
  );


  const BlockListButton = (buttonText) => (
    <button
    // fix to switch to CustomBlock canvas
    onClick={() => {setBlockList(true)}}
      style={{
        backgroundColor: 'teal',
        color: 'white',
        transition: 'background-color 0.3s',
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'lightblue';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'teal';
      }}
    >
      {buttonText}
    </button>
  );

// if(blockList){
//   switch (userRole) {
//     case 'DefaultUser':
//       return <PublicCanvas activity={activity} isSandbox={isSandbox} userRole={userRole}/>;
//     case 'Student':
//       return <StudentCanvas activity={activity} />;
//     case 'Mentor':
//       return <MentorCanvas
//       activity={activity}
//       setActivity={setActivity}
//       isSandbox={isSandbox}
//       isMentorActivity={!activity.selectedToolbox && !isSandbox}
//       />;
//     case 'ContentCreator':
//       return (
//         <ContentCreatorCanvas
//           activity={activity}
//           setActivity={setActivity}
//           isSandbox={isSandbox}
//           isMentorActivity={!activity.selectedToolbox && !isSandbox}
//         />
//       );
//   }
// }
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
                {selectedFeature}
              </Col>
            </Row>
            <div id='blockly-canvas' />
            <Row id='list-left'>
              Block Listings
            </Row>
            <Row id='list-midtop'>
              Block Preview
            </Row>
            <Row id='list-midbottom'>
              Block Documentation
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
