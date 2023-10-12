import { Button, Card, Form, List, message, Modal } from "antd"
import React, { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  createActivity,
  deleteActivity,
  getLessonModuleActivities,
} from "../../../Utils/requests"
import ActivityDetailModal from "./components/ActivityDetailModal"
import "./ActivityEditor.less"

const ActivityEditor = ({ learningStandard, viewing, setViewing, page, tab }) => {
  const [visible, setVisible] = useState(false)
  const [activityDetailsVisible, setActivityDetailsVisible] = useState(false)
  const [activities, setActivities] = useState([])
  const [selectActivity, setSelectActivity] = useState("")
  // eslint-disable-next-line
  const [_, setSearchParams] = useSearchParams()

  const showActivityDetailsModal = async activityObj => {
    setActivityDetailsVisible(true)
    setSelectActivity(activityObj)
  }

  useEffect(() => {
    const getSavedActivity = async () => {
      if (viewing && viewing === learningStandard.id) {
        const getActivityAll = await getLessonModuleActivities(viewing)
        const myActivities = getActivityAll.data
        myActivities.sort((a, b) => (a.number > b.number ? 1 : -1))
        setActivities([...myActivities])
        setVisible(true)
      }
    }
    getSavedActivity()
  }, [viewing, learningStandard.id])

  const addBasicActivity = async () => {
    let newActivity = 1
    if (activities.length !== 0) {
      newActivity = parseInt(activities[activities.length - 1].number) + 1
    }

    const response = await createActivity(newActivity, learningStandard.id)
    if (response.err) {
      message.error(response.err)
    }
    setActivities([...activities, response.data])
  }

  const removeBasicActivity = async currActivity => {
    if (window.confirm(`Deleting Activity ${currActivity.number}`)) {
      const response = await deleteActivity(currActivity.id)
      if (response.err) {
        message.error(response.err)
      }

      const getActivityAll = await getLessonModuleActivities(learningStandard.id)
      if (getActivityAll.err) {
        message.error(getActivityAll.err)
      }
      setActivities([...getActivityAll.data])
    }
  }

  const handleCancel = () => {
    setVisible(false)
    setViewing(undefined)
    setSearchParams({ tab, page })
  }

  return (
    <div>
      <Modal
        title={learningStandard.name}
        open={visible}
        onCancel={handleCancel}
        footer={null}
        size="large"
      >
        <div className="list-position">
          {activities.length > 0 ? (
            <div>
              <p id="activity-editor-subtitle">
                Click on a <strong>Activity</strong> to edit details and workspace
              </p>
              <List
                grid={{ gutter: 16, column: 3 }}
                style={{ marginTop: "2vh" }}
                dataSource={activities}
                renderItem={item => (
                  <List.Item>
                    <Card
                      id="card-activity"
                      key={item.id}
                      title={"Activity " + item.number}
                      hoverable="true"
                      style={item.description ? { background: "#a6ffb3" } : {}}
                      onClick={() => showActivityDetailsModal(item)}
                    />
                    <span
                      className="delete-btn"
                      onClick={() => removeBasicActivity(item)}
                    >
                      &times;
                    </span>
                  </List.Item>
                )}
              />
            </div>
          ) : null}
          <div>
            <Form
              id="add-activity"
              wrapperCol={{
                span: 14,
              }}
              layout="horizontal"
              size="default"
            >
              <Form.Item
                wrapperCol={{
                  offset: 8,
                  span: 16,
                }}
                style={{ marginBottom: "0px" }}
              >
                <Button
                  onClick={addBasicActivity}
                  type="primary"
                  size="large"
                  className="content-creator-button"
                >
                  Add Activity
                </Button>
                <Button
                  onClick={handleCancel}
                  size="large"
                  className="content-creator-button"
                >
                  Cancel
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>

      {activityDetailsVisible && (
        <ActivityDetailModal
          learningStandard={learningStandard}
          selectActivity={selectActivity}
          activityDetailsVisible={activityDetailsVisible}
          setActivityDetailsVisible={setActivityDetailsVisible}
          setActivities={setActivities}
          viewing={viewing}
        />
      )}
    </div>
  )
}

export default ActivityEditor
