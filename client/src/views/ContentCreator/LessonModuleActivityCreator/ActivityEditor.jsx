import { Button, Card, Form, List, message, Modal } from "antd"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  createActivity,
  deleteActivity,
  getActivityToolbox,
  getActivityToolboxAll,
  getLessonModule,
} from "../../../Utils/requests"
import "./ActivityEditor.less"

export default function ContentCreator({ learningStandard }) {
  const [visible, setVisible] = useState(false)
  const [activities, setActivities] = useState([])

  const navigate = useNavigate()

  const handleCancel = () => {
    setVisible(false)
  }

  const showModal = async () => {
    const lsResponse = await getLessonModule(learningStandard.id)
    const myActivities = lsResponse.data.activities
    myActivities.sort((a, b) => (a.number > b.number ? 1 : -1))
    setActivities([...myActivities])
    setVisible(true)
  }

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

      const lsResponse = await getLessonModule(learningStandard.id)
      if (lsResponse.err) {
        message.error(lsResponse.err)
      }
      setActivities([...lsResponse.data.activities])
    }
  }

  const handleViewActivities = async activity => {
    const allToolBoxRes = await getActivityToolboxAll()
    const selectedToolBoxRes = await getActivityToolbox(activity.id)
    activity.selectedToolbox = selectedToolBoxRes.data.toolbox
    activity.toolbox = allToolBoxRes.data.toolbox

    activity.lesson_module_name = learningStandard.name
    localStorage.setItem("my-activity", JSON.stringify(activity))
    navigate("/activity")
  }

  return (
    <div>
      <button id="link-btn" onClick={showModal}>
        {learningStandard.name}
      </button>

      <Modal
        title={learningStandard.name}
        open={visible}
        onCancel={handleCancel}
        onOk={handleCancel}
        size="large"
      >
        <div className="list-position">
          {activities.length > 0 ? (
            <List
              grid={{ gutter: 16, column: 3 }}
              dataSource={activities}
              renderItem={item => (
                <List.Item>
                  <Card
                    id="card-activity"
                    key={item.id}
                    title={"Activity " + item.number}
                    hoverable={true}
                    onClick={() => handleViewActivities(item)}
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
              <Button onClick={addBasicActivity} type="primary">
                Add Activity
              </Button>
            </Form>
          </div>
        </div>
      </Modal>
    </div>
  )
}
