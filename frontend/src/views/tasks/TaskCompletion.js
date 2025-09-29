// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Snackbar from '@mui/material/Snackbar'

// ** Context Imports
import { useAuth } from 'src/contexts/AuthContext'

// ** Utils Imports
import { getRandomYouTubeVideo } from 'src/utils/youtubeVideos'

// ** Component Imports
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

const TaskCompletion = () => {
  const { token, refreshUser } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [completionData, setCompletionData] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [completedTasks, setCompletedTasks] = useState(new Set())
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchAvailableTasks()
    fetchCompletedTasks()
  }, [token])

  const fetchAvailableTasks = async () => {
    if (!token) {
      setError('No authentication token found')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('https://official-paypal.onrender.com/api/tasks/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
        // Update AuthContext with latest user data
        await refreshUser()
      } else {
        setError('Failed to fetch available tasks')
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setError('Network error while fetching tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchCompletedTasks = async () => {
    if (!token) return

    try {
      const response = await fetch('https://official-paypal.onrender.com/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const completedTaskIds = new Set()
        // Extract completed task IDs from analytics if available
        if (data.analytics?.tasks?.completed_tasks) {
          data.analytics.tasks.completed_tasks.forEach(taskId => {
            completedTaskIds.add(taskId)
          })
        }
        setCompletedTasks(completedTaskIds)
      }
    } catch (error) {
      console.error('Error fetching completed tasks:', error)
    }
  }

  const getTaskTypeIcon = (type) => {
    const icons = {
      'survey': '📊',
      'video': '🎥',
      'ad': '📺',
      'writing': '✍️',
      'social': '📱',
      'image': '🖼️',
      'upload': '📤'
    }
    return icons[type] || '📋'
  }

  const getTaskTypeColor = (type) => {
    const colors = {
      'survey': 'primary',
      'video': 'secondary',
      'ad': 'info',
      'writing': 'success',
      'social': 'warning',
      'image': 'error',
      'upload': 'default'
    }
    return colors[type] || 'default'
  }

  const handleStartTask = (task) => {
    setSelectedTask(task)
    // Initialize completion data based on task type
    const initialData = {}
    if (task.type === 'survey') {
      initialData.answers = [-1] // One question, not answered yet
    }
    setCompletionData(initialData)
    setShowCompletionDialog(true)
  }

  const generateRandomQuiz = () => {
    const quizQuestions = [
      {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1
      },
      {
        question: "What is 2 + 2 × 3?",
        options: ["8", "10", "12", "14"],
        correct: 0
      },
      {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        correct: 2
      },
      {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correct: 3
      },
      {
        question: "Which programming language is this code written in?",
        options: ["Python", "JavaScript", "Java", "C++"],
        correct: 1
      },
      {
        question: "What year was the first iPhone released?",
        options: ["2005", "2006", "2007", "2008"],
        correct: 2
      },
      {
        question: "Which social media platform was founded first?",
        options: ["Facebook", "Twitter", "Instagram", "LinkedIn"],
        correct: 0
      },
      {
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correct: 2
      },
      {
        question: "Which gas do plants absorb from the atmosphere?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        correct: 2
      },
      {
        question: "What is the largest mammal in the world?",
        options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
        correct: 1
      },
      {
        question: "In which year did World War II end?",
        options: ["1944", "1945", "1946", "1947"],
        correct: 1
      },
      {
        question: "What is the smallest country in the world?",
        options: ["Monaco", "Nauru", "Vatican City", "San Marino"],
        correct: 2
      },
      {
        question: "Which vitamin is produced when skin is exposed to sunlight?",
        options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
        correct: 3
      },
      {
        question: "What is the most spoken language in the world by number of native speakers?",
        options: ["English", "Spanish", "Mandarin Chinese", "Hindi"],
        correct: 2
      },
      {
        question: "Which element has the atomic number 1?",
        options: ["Helium", "Hydrogen", "Lithium", "Carbon"],
        correct: 1
      },
      {
        question: "What is the capital of Australia?",
        options: ["Sydney", "Melbourne", "Canberra", "Perth"],
        correct: 2
      },
      {
        question: "Which organ in the human body is responsible for pumping blood?",
        options: ["Brain", "Lungs", "Heart", "Liver"],
        correct: 2
      },
      {
        question: "What is the largest desert in the world?",
        options: ["Sahara Desert", "Gobi Desert", "Antarctic Desert", "Arabian Desert"],
        correct: 2
      },
      {
        question: "Which gas makes up the majority of Earth's atmosphere?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
        correct: 2
      },
      {
        question: "What is the currency of Japan?",
        options: ["Won", "Yen", "Yuan", "Ringgit"],
        correct: 1
      },
      {
        question: "Which planet is known as the Morning Star?",
        options: ["Mars", "Venus", "Jupiter", "Mercury"],
        correct: 1
      },
      {
        question: "What is the largest bone in the human body?",
        options: ["Skull", "Femur", "Spine", "Ribs"],
        correct: 1
      },
      {
        question: "Which programming language was created by Guido van Rossum?",
        options: ["Java", "Python", "C++", "JavaScript"],
        correct: 1
      },
      {
        question: "What is the capital of Canada?",
        options: ["Toronto", "Vancouver", "Ottawa", "Montreal"],
        correct: 2
      },
      {
        question: "Which vitamin is also known as retinol?",
        options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
        correct: 0
      },
      {
        question: "What is the smallest planet in our solar system?",
        options: ["Venus", "Mars", "Mercury", "Pluto"],
        correct: 2
      },
      {
        question: "Which element has the chemical symbol 'O'?",
        options: ["Gold", "Oxygen", "Silver", "Iron"],
        correct: 1
      },
      {
        question: "What is the capital of Brazil?",
        options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"],
        correct: 2
      },
      {
        question: "Which gas do humans exhale?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"],
        correct: 2
      },
      {
        question: "What is the largest continent by land area?",
        options: ["Africa", "Asia", "North America", "Europe"],
        correct: 1
      },
      {
        question: "Which programming language is known for its use in web development and has a coffee-related name?",
        options: ["Python", "Java", "JavaScript", "C#"],
        correct: 2
      },
      {
        question: "What is the capital of Russia?",
        options: ["Saint Petersburg", "Moscow", "Novosibirsk", "Yekaterinburg"],
        correct: 1
      },
      {
        question: "Which organ is responsible for filtering blood in the human body?",
        options: ["Heart", "Lungs", "Kidneys", "Liver"],
        correct: 2
      },
      {
        question: "What is the chemical formula for water?",
        options: ["CO2", "H2O", "O2", "NaCl"],
        correct: 1
      },
      {
        question: "Which country is home to the kangaroo?",
        options: ["New Zealand", "South Africa", "Australia", "Brazil"],
        correct: 2
      },
      {
        question: "What is the most abundant gas in the Earth's atmosphere?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        correct: 2
      },
      {
        question: "Which element has the atomic number 6?",
        options: ["Carbon", "Nitrogen", "Oxygen", "Hydrogen"],
        correct: 0
      },
      {
        question: "What is the capital of Egypt?",
        options: ["Alexandria", "Cairo", "Luxor", "Giza"],
        correct: 1
      },
      {
        question: "Which vitamin is essential for blood clotting?",
        options: ["Vitamin A", "Vitamin K", "Vitamin C", "Vitamin D"],
        correct: 1
      },
      {
        question: "What is the largest internal organ in the human body?",
        options: ["Heart", "Brain", "Liver", "Lungs"],
        correct: 2
      },
      {
        question: "Which gas is used in balloons to make them float?",
        options: ["Oxygen", "Nitrogen", "Helium", "Carbon Dioxide"],
        correct: 2
      },
      {
        question: "What is the capital of South Korea?",
        options: ["Busan", "Incheon", "Seoul", "Daegu"],
        correct: 2
      },
      {
        question: "Which planet has the most moons?",
        options: ["Earth", "Mars", "Jupiter", "Saturn"],
        correct: 3
      },
      {
        question: "What is the chemical symbol for sodium?",
        options: ["So", "Na", "Sd", "S"],
        correct: 1
      },
      {
        question: "Which country invented paper?",
        options: ["India", "Egypt", "China", "Greece"],
        correct: 2
      },
      {
        question: "What is the most common blood type?",
        options: ["A", "B", "O", "AB"],
        correct: 2
      },
      {
        question: "Which element is diamond made of?",
        options: ["Carbon", "Oxygen", "Nitrogen", "Hydrogen"],
        correct: 0
      },
      {
        question: "What is the capital of Argentina?",
        options: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza"],
        correct: 0
      },
      {
        question: "Which vitamin helps with vision?",
        options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
        correct: 0
      },
      {
        question: "What is the largest artery in the human body?",
        options: ["Aorta", "Pulmonary Artery", "Carotid Artery", "Femoral Artery"],
        correct: 0
      },
      {
        question: "Which gas do we need to breathe to survive?",
        options: ["Carbon Dioxide", "Nitrogen", "Oxygen", "Helium"],
        correct: 2
      },
      {
        question: "What is the capital of Turkey?",
        options: ["Istanbul", "Ankara", "Izmir", "Antalya"],
        correct: 1
      },
      {
        question: "Which organ produces insulin?",
        options: ["Liver", "Pancreas", "Kidneys", "Stomach"],
        correct: 1
      },
      {
        question: "What is the chemical symbol for iron?",
        options: ["Ir", "Fe", "In", "I"],
        correct: 1
      },
      {
        question: "Which country is known as the Land of the Rising Sun?",
        options: ["China", "Japan", "Korea", "Thailand"],
        correct: 1
      },
      {
        question: "What is the most abundant mineral in the human body?",
        options: ["Iron", "Calcium", "Potassium", "Sodium"],
        correct: 1
      },
      {
        question: "Which element has the atomic number 8?",
        options: ["Nitrogen", "Oxygen", "Carbon", "Hydrogen"],
        correct: 1
      },
      {
        question: "What is the capital of Mexico?",
        options: ["Guadalajara", "Monterrey", "Mexico City", "Puebla"],
        correct: 2
      },
      {
        question: "Which vitamin is found in citrus fruits?",
        options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
        correct: 2
      },
      {
        question: "What is the largest muscle in the human body?",
        options: ["Biceps", "Quadriceps", "Gluteus Maximus", "Abdominal"],
        correct: 2
      },
      {
        question: "Which gas is produced during photosynthesis?",
        options: ["Carbon Dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
        correct: 1
      },
      {
        question: "What is the capital of Thailand?",
        options: ["Bangkok", "Phuket", "Chiang Mai", "Pattaya"],
        correct: 0
      },
      {
        question: "Which organ is responsible for producing bile?",
        options: ["Liver", "Pancreas", "Gallbladder", "Stomach"],
        correct: 0
      },
      {
        question: "What is the chemical symbol for potassium?",
        options: ["P", "K", "Po", "Pt"],
        correct: 1
      },
      {
        question: "Which country has the most time zones?",
        options: ["Russia", "United States", "China", "France"],
        correct: 3
      },
      {
        question: "What is the smallest bone in the human body?",
        options: ["Stapes", "Incus", "Malleus", "Cochlea"],
        correct: 0
      },
      {
        question: "Which element has the atomic number 2?",
        options: ["Hydrogen", "Helium", "Lithium", "Beryllium"],
        correct: 1
      },
      {
        question: "What is the capital of India?",
        options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
        correct: 1
      },
      {
        question: "Which vitamin is important for bone health?",
        options: ["Vitamin A", "Vitamin D", "Vitamin C", "Vitamin B"],
        correct: 1
      },
      {
        question: "What is the largest gland in the human body?",
        options: ["Liver", "Pancreas", "Thyroid", "Adrenal"],
        correct: 0
      },
      {
        question: "Which gas is used in fire extinguishers?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"],
        correct: 1
      },
      {
        question: "What is the capital of Germany?",
        options: ["Munich", "Berlin", "Hamburg", "Cologne"],
        correct: 1
      },
      {
        question: "Which organ removes waste from the blood?",
        options: ["Heart", "Lungs", "Liver", "Kidneys"],
        correct: 3
      },
      {
        question: "What is the chemical symbol for silver?",
        options: ["Si", "Ag", "Sv", "Sl"],
        correct: 1
      },
      {
        question: "Which country is the largest by population?",
        options: ["India", "United States", "China", "Indonesia"],
        correct: 2
      },
      {
        question: "What is the strongest muscle in the human body?",
        options: ["Heart", "Tongue", "Masseter", "Biceps"],
        correct: 2
      },
      {
        question: "Which element has the atomic number 7?",
        options: ["Carbon", "Nitrogen", "Oxygen", "Fluorine"],
        correct: 1
      },
      {
        question: "What is the capital of Italy?",
        options: ["Milan", "Rome", "Venice", "Florence"],
        correct: 1
      },
      {
        question: "Which vitamin is synthesized by our skin?",
        options: ["Vitamin A", "Vitamin D", "Vitamin C", "Vitamin K"],
        correct: 1
      },
      {
        question: "What is the largest planet in our solar system?",
        options: ["Saturn", "Jupiter", "Uranus", "Neptune"],
        correct: 1
      },
      {
        question: "Which gas is responsible for the greenhouse effect?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Methane"],
        correct: 2
      },
      {
        question: "What is the capital of Spain?",
        options: ["Barcelona", "Madrid", "Valencia", "Seville"],
        correct: 1
      },
      {
        question: "Which organ produces red blood cells?",
        options: ["Liver", "Spleen", "Bone Marrow", "Kidneys"],
        correct: 2
      },
      {
        question: "What is the chemical symbol for copper?",
        options: ["Co", "Cu", "Cp", "Cr"],
        correct: 1
      },
      {
        question: "Which country has the most natural lakes?",
        options: ["Canada", "Russia", "United States", "Brazil"],
        correct: 0
      },
      {
        question: "What is the smallest planet in our solar system?",
        options: ["Mercury", "Venus", "Mars", "Pluto"],
        correct: 0
      },
      {
        question: "Which element has the atomic number 3?",
        options: ["Lithium", "Beryllium", "Boron", "Carbon"],
        correct: 0
      },
      {
        question: "What is the capital of the United Kingdom?",
        options: ["Manchester", "London", "Birmingham", "Liverpool"],
        correct: 1
      },
      {
        question: "Which vitamin is essential for healthy skin?",
        options: ["Vitamin A", "Vitamin E", "Vitamin C", "Vitamin D"],
        correct: 1
      },
      {
        question: "What is the largest freshwater lake in the world?",
        options: ["Lake Superior", "Lake Victoria", "Lake Baikal", "Lake Tanganyika"],
        correct: 0
      },
      {
        question: "Which gas is used in fluorescent lights?",
        options: ["Neon", "Argon", "Krypton", "Xenon"],
        correct: 1
      },
      {
        question: "What is the capital of China?",
        options: ["Shanghai", "Beijing", "Guangzhou", "Shenzhen"],
        correct: 1
      },
      {
        question: "Which organ is responsible for detoxification?",
        options: ["Liver", "Kidneys", "Lungs", "Spleen"],
        correct: 0
      },
      {
        question: "What is the chemical symbol for lead?",
        options: ["Ld", "Pb", "Le", "Pl"],
        correct: 1
      },
      {
        question: "Which country is known as the Land of Fire and Ice?",
        options: ["Norway", "Iceland", "Greenland", "Finland"],
        correct: 1
      },
      {
        question: "What is the most flexible muscle in the human body?",
        options: ["Heart", "Tongue", "Diaphragm", "Esophagus"],
        correct: 1
      },
      {
        question: "Which element has the atomic number 5?",
        options: ["Boron", "Carbon", "Nitrogen", "Oxygen"],
        correct: 0
      },
      {
        question: "What is the capital of South Africa?",
        options: ["Cape Town", "Johannesburg", "Durban", "Pretoria"],
        correct: 0
      },
      {
        question: "Which vitamin helps in wound healing?",
        options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"],
        correct: 1
      },
      {
        question: "What is the largest island in the world?",
        options: ["Greenland", "New Guinea", "Borneo", "Madagascar"],
        correct: 0
      },
      {
        question: "Which gas is used in scuba diving tanks?",
        options: ["Oxygen", "Nitrogen", "Compressed Air", "Helium"],
        correct: 2
      }
    ]
    // Return a single random question
    const randomIndex = Math.floor(Math.random() * quizQuestions.length)
    return [quizQuestions[randomIndex]]
  }

  const handleCloseDialog = () => {
    setShowCompletionDialog(false)
    setSelectedTask(null)
    setCompletionData({})
  }

  const handleInputChange = (field, value) => {
    setCompletionData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateCompletionData = (task, data) => {
    const taskType = task.type
    const requirements = task.requirements || {}

    switch (taskType) {
      case 'survey':
        const answers = data.answers || []
        if (answers.length === 0) {
          return 'Please provide answers to all survey questions'
        }
        if (answers.length !== 1) { // We generate 1 quiz question
          return 'Please answer the quiz question'
        }
        if (answers.some(answer => answer === -1)) {
          return 'Please select an answer for all questions'
        }
        break

      case 'video':
      case 'ad':
        if (!data.watched_duration || data.watched_duration < requirements.duration) {
          return `Please watch the full video (${requirements.duration}s required)`
        }
        if (task.media?.youtube_id && !data.youtube_timestamp) {
          return 'Please provide YouTube timestamp for verification'
        }
        break

      case 'writing':
        const content = data.content || ''
        const minWords = requirements.min_words || 100
        const wordCount = content.trim().split(/\s+/).length
        if (wordCount < minWords) {
          return `Content must be at least ${minWords} words (current: ${wordCount})`
        }
        break

      case 'social':
        const shareUrls = data.share_urls || []
        if (shareUrls.length === 0) {
          return 'Please provide share URLs for all required platforms'
        }
        if (shareUrls.some(url => !url.startsWith('http'))) {
          return 'All share URLs must be valid links'
        }
        break

      case 'image':
      case 'upload':
        if (!data.image_url || !data.image_url.startsWith('http')) {
          return 'Please provide a valid image URL'
        }
        break

      default:
        return null
    }

    return null
  }

  const handleCompleteTask = async () => {
    if (!selectedTask) return

    const validationError = validateCompletionData(selectedTask, completionData)
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('https://official-paypal.onrender.com/api/tasks/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task_id: selectedTask.task_id,
          completion_data: completionData
        })
      })

      if (response.ok) {
        const result = await response.json()
        // Add to completed tasks
        setCompletedTasks(prev => new Set([...prev, selectedTask.task_id]))
        handleCloseDialog()
        // Refresh tasks
        fetchAvailableTasks()

        // Show success message instead of alert
        setSuccessMessage(`Task completed successfully! You earned KES ${result.reward}`)
        setShowSuccess(true)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to complete task')
      }
    } catch (error) {
      console.error('Error completing task:', error)
      setError('Network error while completing task')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    setSuccessMessage('')
  }

  const renderCompletionForm = () => {
    if (!selectedTask) return null

    const taskType = selectedTask.type
    const requirements = selectedTask.requirements || {}
    const media = selectedTask.media || {}

    switch (taskType) {
      case 'survey':
        const quizQuestions = generateRandomQuiz()
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Random Quiz - Select the correct answers
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Answer all questions by checking the correct option for each question.
            </Typography>
            {quizQuestions.map((quizItem, index) => (
              <Box key={index} sx={{ mb: 4, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Question {index + 1}: {quizItem.question}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {quizItem.options.map((option, optionIndex) => (
                    <FormControlLabel
                      key={optionIndex}
                      control={
                        <Checkbox
                          checked={completionData.answers?.[index] === optionIndex}
                          onChange={(e) => {
                            const newAnswers = [...(completionData.answers || [])]
                            newAnswers[index] = e.target.checked ? optionIndex : -1
                            handleInputChange('answers', newAnswers)
                          }}
                        />
                      }
                      label={option}
                    />
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Question {index + 1} of {quizQuestions.length}
                </Typography>
              </Box>
            ))}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Instructions:</strong> Check the correct answer for each question. You can only select one option per question.
                Make sure to answer all questions before submitting.
              </Typography>
            </Alert>
          </Box>
        )

      case 'video':
      case 'ad':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Video Task
            </Typography>
            {media.video_url && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Video URL:
                </Typography>
                <a href={media.video_url} target="_blank" rel="noopener noreferrer">
                  {media.video_url}
                </a>
              </Box>
            )}
            {(media.youtube_id || taskType === 'video' || taskType === 'ad') && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  YouTube Video:
                </Typography>
                <a
                  href={`https://youtube.com/watch?v=${media.youtube_id || getRandomYouTubeVideo()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch on YouTube
                </a>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Random video selected for this task
                </Typography>
              </Box>
            )}
            <TextField
              fullWidth
              type="number"
              label="Watched Duration (seconds)"
              value={completionData.watched_duration || ''}
              onChange={(e) => handleInputChange('watched_duration', parseInt(e.target.value))}
              sx={{ mb: 2 }}
            />
            {(media.youtube_id || taskType === 'video' || taskType === 'ad') && (
              <TextField
                fullWidth
                label="YouTube Timestamp (e.g., 1:23)"
                value={completionData.youtube_timestamp || ''}
                onChange={(e) => handleInputChange('youtube_timestamp', e.target.value)}
                sx={{ mb: 2 }}
              />
            )}
          </Box>
        )

      case 'writing':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Writing Task
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              label={`Write at least ${requirements.min_words || 100} words`}
              value={completionData.content || ''}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Write your content here..."
            />
          </Box>
        )

      case 'social':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Social Media Sharing
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Required platforms: {requirements.platforms?.join(', ') || 'Any platform'}
            </Typography>
            {requirements.platforms?.map((platform, index) => (
              <TextField
                key={platform}
                fullWidth
                label={`${platform} Share URL`}
                value={completionData.share_urls?.[index] || ''}
                onChange={(e) => {
                  const newUrls = [...(completionData.share_urls || [])]
                  newUrls[index] = e.target.value
                  handleInputChange('share_urls', newUrls)
                }}
                placeholder={`https://${platform}.com/your-post`}
                sx={{ mb: 2 }}
              />
            ))}
          </Box>
        )

      case 'image':
      case 'upload':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Image Upload Task
            </Typography>
            <TextField
              fullWidth
              label="Image URL"
              value={completionData.image_url || ''}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Please upload an image that meets the task requirements and paste the URL above.
            </Typography>
          </Box>
        )

      default:
        return (
          <Typography variant="body1">
            Task type not supported yet.
          </Typography>
        )
    }
  }

  if (loading) {
    return <LinearProgress />
  }

  if (error && tasks.length === 0) {
    return (
      <Alert severity="error" sx={{ mb: 4 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Complete Tasks to Earn Money
      </Typography>

      {tasks.length === 0 ? (
        <Alert severity="info">
          No tasks available at the moment. Check back later!
        </Alert>
      ) : (
        <Grid container spacing={4}>
          {tasks.map((task) => (
            <Grid item xs={12} md={6} key={task.task_id}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: theme => theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
                  : 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 50%, #fff3e0 100%)',
                borderRadius: '20px',
                boxShadow: theme => theme.palette.mode === 'dark'
                  ? '0 20px 40px rgba(0, 123, 255, 0.3), 0 0 20px rgba(255, 215, 0, 0.1)'
                  : '0 20px 40px rgba(0, 123, 255, 0.2), 0 0 20px rgba(255, 215, 0, 0.1)',
                border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(0,123,255,0.2)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent)',
                  transition: 'left 0.5s',
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: theme => theme.palette.mode === 'dark'
                    ? '0 30px 60px rgba(0, 123, 255, 0.4), 0 0 30px rgba(255, 215, 0, 0.2)'
                    : '0 30px 60px rgba(0, 123, 255, 0.3), 0 0 30px rgba(255, 215, 0, 0.15)',
                  '&::before': {
                    left: '100%',
                  }
                },
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ mr: 1 }}>
                      {getTaskTypeIcon(task.type)}
                    </Typography>
                    <Typography variant="h6">
                      {task.title}
                    </Typography>
                    <Chip
                      label={task.type}
                      color={getTaskTypeColor(task.type)}
                      size="small"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {task.description}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="primary">
                      KES {task.reward}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => handleStartTask(task)}
                      disabled={completedTasks.has(task.task_id)}
                    >
                      {completedTasks.has(task.task_id) ? 'Completed' : 'Start Task'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Task Completion Dialog */}
      <Dialog
        open={showCompletionDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Complete Task: {selectedTask?.title}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {selectedTask?.description}
          </Typography>

          {renderCompletionForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleCompleteTask}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Complete Task'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default TaskCompletion
