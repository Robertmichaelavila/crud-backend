import { Router } from 'express'
import { ProjectController } from '../controllers/ProjectController'
import { UserController } from '../controllers/UserController'
import { TaskController } from '../controllers/TaskController'
import { AuthController } from '../controllers/AuthController'
import { authMiddleware } from '../middleware/auth'

const authController = new AuthController()

const router = Router()

const projectController = new ProjectController()
const userController = new UserController()
const taskController = new TaskController()

// Autenticação
router.post('/signup', authController.signup)
router.post('/signin', authController.signin)

// Projetos do usuário
router.post('/projects', authMiddleware, projectController.create)
router.get('/projects', authMiddleware, projectController.list)

// membros do projeto
router.post(
  '/projects/:projectId/members',
  authMiddleware,
  userController.addToProject
)

// tarefas do projeto
router.post(
  '/projects/:projectId/tasks',
  authMiddleware,
  taskController.create
)

router.get(
  '/projects/:projectId/tasks',
  authMiddleware,
  taskController.list
)

// usuários (global)
router.get('/users', authMiddleware, userController.list)

export default router