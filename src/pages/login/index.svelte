<script>
  import { redirect } from '@roxi/routify'
  import { onMount, tick } from 'svelte'

  import { auth } from '../../helpers/auth.js'
  import { getRandomString } from '../../helpers/misc.js'

  let authError
  let shouldShowLayout
  let submitted
  let usernameEl

  const formFields = {
    password: '',
    username: '',
  }

  const userId = getRandomString()

  const redirectToMain = () => {
    const params = new URLSearchParams(window.location.search)
    $redirect('/?' + params.toString())
  }

  const handleSubmit = async () => {
    const { Color } = window.zeaEngine

    const userData = {
      avatar: `https://i.pravatar.cc/100?u=${userId}`,
      color: Color.random().toHex(),
      firstName: formFields.username,
      id: userId,
      lastName: '',
      password: formFields.password,
      username: formFields.username,
    }

    try {
      await auth.setUserData(userData)

      submitted = true
      redirectToMain()
    } catch (err) {
      authError = err
    }
  }

  onMount(async () => {
    const isAuthenticated = await auth.isAuthenticated()

    if (isAuthenticated) {
      redirectToMain()
      return
    }

    shouldShowLayout = true

    await tick()

    usernameEl.focus()
  })
</script>

{#if shouldShowLayout}
  <div
    class="bg-background min-h-screen flex items-center justify-center py-12 px-4 text-foreground sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <h2 class="mt-6 text-center text-3xl font-extrabold">Zea Demo</h2>

      <form
        class="mt-8 space-y-6"
        on:submit|preventDefault|stopPropagation={handleSubmit}
      >
        <div class="rounded-md shadow-sm -space-y-px">
          <div class="mb-2">
            <input
              autocomplete="off"
              bind:this={usernameEl}
              bind:value={formFields.username}
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
              name="username"
              placeholder="Username"
              required
              type="text"
            />
          </div>

          <div>
            <input
              autocomplete="off"
              bind:value={formFields.password}
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
              name="password"
              placeholder="Password"
              required
              type="password"
            />
          </div>
        </div>

        {#if authError}
          <span class="font-medium tracking-wide text-red-500 text-xs">
            {authError.message}
          </span>
        {/if}

        <div>
          <button
            disabled={submitted}
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-800 bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
